import { BaseUserDetails, RegistrationData } from '../providers/base.interface';
import { User } from '../models/user.model';
import { UserAdapter } from '../models/adapter.model';
import { UserNetwork } from '../models/network.model';
import logger from '../utils/logger';

export enum UserServiceError {
    FirstNameIsInvalid = 'Provided First Name is invalid',
    LastNameIsInvalid = 'Provided Last Name is invalid',
    PasswordIsInvalid = 'Password is invalid',
    EmailIsInvalid = 'Email is invalid',
    UserIsAlreadyExist = 'User Is Already Exist',
    UserIsNotExist = 'User Is Not Exist',
}

export interface ValidationMap {
    [key: string]: string;
}

export interface RegisteredUserData {
    err?: ValidationMap;
    data?: BaseUserDetails;
}

export class UserService {
    async tryIdentifyAndUpdateUser(
        user: BaseUserDetails,
        adapterId: string,
    ): Promise<BaseUserDetails> {
        const userExistedByEmail = await User.findOne({
            where: {
                email: user.email,
            },
        });

        let userId = null;
        if (userExistedByEmail) {
            userId = userExistedByEmail.id;
            await userExistedByEmail.update({ lastLoggedInDate: new Date() });
        } else {
            const newUser = await User.create({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                active: true,
                lastLoggedInDate: new Date(),
                password: user.password,
            });

            userId = newUser.id;
            logger.info(
                `User for ${adapterId} has been created. ${user.firstName} ${user.lastName}`,
            );
        }

        if (adapterId) {
            await UserAdapter.upsert({
                userId,
                adapterId,
            });
        }

        if (user.socialNetworkKey) {
            await UserNetwork.upsert({
                userId,
                networkName: user.socialNetworkKey,
                networkInternalId: user.id,
            });
        }

        return user;
    }
}
