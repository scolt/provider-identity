import { BaseUserDetails } from '../providers/base.interface';

import jsonwebtoken from 'jsonwebtoken';
import logger from '../utils/logger';
import config from '../config/config';

import * as crypto from 'crypto';

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

    generateTokenByCode(code: string) {
        const userDetails = this.codes[code];
        if (!userDetails) {
            return '';
        }
        delete this.codes[code];
        return jsonwebtoken.sign({
            id: userDetails.user.id,
            email: userDetails.user.email,
            firstName: userDetails.user.firstName,
            lastName: userDetails.user.lastName,
        },                       config.authTokenSecretKey);
    }
}
