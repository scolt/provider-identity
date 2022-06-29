import * as crypto from 'crypto';
import { DateTime } from 'luxon';

import { SignOptions, sign, verify } from 'jsonwebtoken';
import { BaseUserDetails, TokenPayloadData } from '../providers/base.interface';

import logger from '../utils/logger';
import { UserToken } from '../models/token.model';
import { User } from '../models/user.model';
import { DAY_IN_SECONDS, HOUR_IN_SECONDS } from '../utils/date';
import { Adapter } from '../models/adapter.model';

export interface AuthCodeMap {
    [key: string]: {
        user: BaseUserDetails;
        expireUnixDate: number;
    };
}

export interface TokensSet {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresIn: number;
    refreshTokenExpiresIn: number;
}

export class AuthService {
    codes: AuthCodeMap = {};

    constructor() {
        setInterval(() => this.clearExpiredCodes(), 5 * 60 * 1000);
    }

    clearExpiredCodes(): void {
        for (const codeKey in this.codes) {
            if (Object.prototype.hasOwnProperty.call(this.codes, codeKey)) {
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

    async initializeTokensByDetails(userDetails: BaseUserDetails, adapterEncryptKey: string): Promise<TokensSet> {
        const accessTokenExpiresIn = 24 * HOUR_IN_SECONDS;
        const refreshTokenExpiresIn = 365 * DAY_IN_SECONDS;

        const refreshExpiresDate = DateTime.now().plus({ seconds: refreshTokenExpiresIn }).toJSDate();

        const payload = {
            id: userDetails.id,
            email: userDetails.email,
            firstName: userDetails.firstName,
            lastName: userDetails.lastName,
        };

        const options: SignOptions = {
            expiresIn: accessTokenExpiresIn,
        };

        const refreshPayload = { id: payload.id };
        const refreshOptions = { ...options, expiresIn: refreshTokenExpiresIn };

        const accessToken = sign(payload, adapterEncryptKey, options);
        const refreshToken = sign(refreshPayload, adapterEncryptKey, refreshOptions);

        await UserToken.destroy({ where: { userId: payload.id } });
        await UserToken.create({
            userId: payload.id,
            token: refreshToken,
            expiresDate: refreshExpiresDate,
        });

        return { accessToken, refreshToken, accessTokenExpiresIn, refreshTokenExpiresIn };
    }

    async initializeTokensByCode(code: string, adapterName: string): Promise<TokensSet> {
        const userDetails = this.codes[code];
        const adapter = await Adapter.findOne({ where: { adapterName } });

        if (!adapter) {
            throw new Error(`Adapter is invalid: ${adapterName}.`);
        }

        if (!userDetails) {
            throw new Error('Code is not exist');
        }

        delete this.codes[code];

        return this.initializeTokensByDetails(userDetails.user, adapter.adapterEncryptKey);
    }

    async refreshToken(token: string, adapterName: string): Promise<TokensSet> {
        const tokenCondition = { where: { token } };
        const userToken = await UserToken.findOne(tokenCondition);
        const adapter = await Adapter.findOne({ where: { adapterName } });

        if (!adapter) {
            throw new Error(`Adapter is invalid: ${adapterName}.`);
        }

        if (!userToken) {
            const { id } = verify(token, adapter.adapterEncryptKey, { algorithms: ['RS256'] }) as TokenPayloadData;
            throw new Error(`Refresh token is invalid: ${token}. For user ${id}`);
        }

        if (DateTime.fromJSDate(userToken.expiresDate) <= DateTime.now()) {
            throw new Error(`Refresh token is invalid: ${token}. It is expired`);
        }

        const user = await User.findByPk(userToken.userId);

        if (!user) {
            throw new Error(`User "${userToken.userId}" is not exist anymore.`);
        }

        return this.initializeTokensByDetails(user, adapter.adapterEncryptKey);
    }
}
