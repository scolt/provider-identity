import crypto from 'crypto';
import { BaseUserDetails, RegistrationData, SignInData } from '../base.interface';
import { User } from '../../models/user.model';
import { UserNetwork } from '../../models/network.model';
import { ValidationMap } from '../../services/user.service';
import { EmailService } from '../../services/email.service';
import logger from '../../utils/logger';

export interface ConfirmationCodeObject {
    timer: NodeJS.Timeout;
    details: RegistrationData;
    url: string;
}

export interface ConfirmationCodeDictionary {
    [key: string]: ConfirmationCodeObject;
}

export class AuthSimpleProvider {
    confirmationCodes: ConfirmationCodeDictionary = {};

    constructor(private mailService: EmailService) {}

    async getUserDetailsByCredentials(signInData: SignInData): Promise<BaseUserDetails> {
        const user = await User.findOne({
            where: {
                email: signInData.email,
            },
        });

        if (!user) {
            logger.info(`${signInData.email} does not exist.`);
            throw new Error('Credentials are not valid.');
        }

        const isPasswordValid = User.isPasswordValid(user, signInData.password);

        if (!isPasswordValid) {
            logger.info(`Password for ${signInData.email} is invalid.`);
            throw new Error('Credentials are not valid.');
        }

        user.password = '';
        return user;
    }

    async getRegistrationDataError(user: RegistrationData): Promise<ValidationMap> {
        const errors: ValidationMap = {};
        if (!user.firstName || user.firstName.length === 0) {
            errors.firstName = 'First name is required';
        }
        if (!user.lastName || user.lastName.length === 0) {
            errors.firstName = 'Last name is required';
        }
        if (!user.password || user.password.length < 8 || user.password.length > 16) {
            errors.password = 'Password is required and its length must be >= 8 and <= 16';
        }
        if (!user.email || user.email.indexOf('@') < 1) {
            errors.email = 'Email must be valid';
        } else {
            const userExistByEmail = await User.findOne({
                where: {
                    email: user.email,
                },
                include: [UserNetwork],
            });
            if (userExistByEmail) {
                const networks = userExistByEmail?.networks.map(network => network.networkName).join();

                errors.email = `This email is already in use in registration by ${networks}`;
            }
        }

        return errors;
    }

    async validateCodeAndReturnConfig(code: string): Promise<ConfirmationCodeObject> {
        const config = this.confirmationCodes[code];
        if (config) {
            clearTimeout(this.confirmationCodes[code].timer);
            delete this.confirmationCodes[code];
        }
        return config;
    }

    async sendCodeBasedOnDetails(user: RegistrationData, redirectUrl: string): Promise<boolean> {
        const valueForEncrypt = `code_${user.email}${Date.now()}_register`;
        const code = crypto.createHash('sha1').update(valueForEncrypt).digest('hex');
        this.confirmationCodes[code] = {
            timer: setTimeout(() => delete this.confirmationCodes[code], 5 * 60 * 1000),
            details: user,
            url: redirectUrl,
        };

        try {
            await this.mailService.sendCode(user.email, code);
            return true;
        } catch (e) {
            logger.error(e);
            clearTimeout(this.confirmationCodes[code].timer);
            delete this.confirmationCodes[code];
            return false;
        }
    }
}
