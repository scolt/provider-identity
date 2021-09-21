import { DateTime } from 'luxon';
import * as crypto from 'crypto';

import { BaseUserDetails, TokenPayloadData } from '../providers/base.interface';

import jsonwebtoken, { SignOptions } from 'jsonwebtoken';
import logger from '../utils/logger';
import { config } from '../config';
import { UserToken } from '../models/token.model';
import { User } from '../models/user.model';

export interface AuthCodeMap {
    [key: string]: {
        user: BaseUserDetails,
        expireUnixDate: number,
    };
}

export class AuthService {
    codes: AuthCodeMap = {};

    constructor() {
        setInterval(() => this.clearExpiredCodes(), 5 * 60 * 1000);
    }

    clearExpiredCodes() {
        for (const codeKey in this.codes) {
            if (this.codes.hasOwnProperty(codeKey)) {
                const isExpired = this.codes[codeKey].expireUnixDate < Date.now();
                if (isExpired) {
                    delete this.codes[codeKey];
                }
            }
        }
    }

    generateCodeByUser(userDetails: BaseUserDetails): string {
        const expiredUnixDate = Date.now() + 5 * 60 * 1000;
        const valueForEncrypt = `CEDO_${userDetails.email}${userDetails.id}${Date.now()}_SUCERD`;
        const code = crypto.createHash('sha1').update(valueForEncrypt).digest('hex');
        logger.debug(`New code has been generated, expires: ${expiredUnixDate}`);
        this.codes[code] = {
            user: userDetails,
            expireUnixDate: expiredUnixDate,
        };
        return code;
    }

    async initializeTokensByDetails(userDetails: BaseUserDetails) {
        const accessTokenExpiresIn = 3 * 60 * 60;
        const refreshTokenExpiresIn = 365 * 24 * 60 * 60;

        const refreshExpiresDate = new DateTime();
        refreshExpiresDate.plus({ seconds: refreshTokenExpiresIn });

        const payload = {
            id: userDetails.id,
            email: userDetails.email,
            firstName: userDetails.firstName,
            lastName: userDetails.lastName,
        };

        const options: SignOptions = {
            algorithm: 'RS256',
            expiresIn: accessTokenExpiresIn,
        };

        const refreshPayload = { id: payload.id };
        const refreshOptions = { ...options, expiresIn: refreshTokenExpiresIn };

        const accessToken = jsonwebtoken.sign(payload, config.privateKey, options);
        const refreshToken = jsonwebtoken.sign(refreshPayload, config.privateKey, refreshOptions);

        await UserToken.destroy({ where: { userId: payload.id } });
        await UserToken.create({
            userId: payload.id,
            token: refreshToken,
            expiresDate: refreshExpiresDate,
        });

        return { accessToken, refreshToken, accessTokenExpiresIn, refreshTokenExpiresIn  };
    }

    async initializeTokensByCode(code: string) {
        const userDetails = this.codes[code];

        if (!userDetails) {
            throw new Error('Code is not exist');
        }

        delete this.codes[code];

        return this.initializeTokensByDetails(userDetails.user);
    }

    async refreshToken(token: string) {
        const tokenCondition = { where: { token } };
        const userToken = await UserToken.findOne(tokenCondition);
        if (!userToken) {
            const { id } = jsonwebtoken.verify(
                token, config.publicKey,
                { algorithms: ['RS256'] },
            ) as TokenPayloadData;
            throw new Error(`Refresh token is invalid: ${token}. For user ${id}`);
        }

        const user = await User.findByPk(userToken.userId);

        if (!user) {
            throw new Error(`User "${userToken.userId}" is not exist anymore.`);
        }

        return this.initializeTokensByDetails(user);
    }
}
