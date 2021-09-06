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
    // async trySignInUser(user: any, adapterId: string): Promise<RegisteredUserData> {
    //     if (!user.password) return { err: { err : UserServiceError.PasswordIsInvalid } };
    //     if (!user.email) return { err: { err: UserServiceError.EmailIsInvalid } };
    //
    //     const userExistByEmail = await User.findOne({
    //         where: {
    //             email: user.email,
    //         },
    //     });
    //
    //     if (!userExistByEmail) return { err: { err: UserServiceError.UserIsNotExist } };
    //
    //     if(!User.isPasswordValid(userExistByEmail, user.password)) {
    //         return { err: { err: UserServiceError.PasswordIsInvalid } };
    //     } else {
    //         return {
    //             data: {
    //                 id: userExistByEmail.id,
    //                 firstName: userExistByEmail.firstName,
    //                 lastName: userExistByEmail.lastName,
    //                 email: userExistByEmail.email,
    //                 socialNetworkKey: 'manual registration'
    //             }
    //         };
    //     }
    // }
    //
    // async tryRegisterUser(user: any, adapterId: string): Promise<RegisteredUserData> {
    //     const errors = await this.getRegistrationDataError(user);
    //     if (Object.values(errors).length) return { err: errors };
    //
    //     const newUser = await User.create({
    //         firstName: user.firstName,
    //         lastName: user.lastName,
    //         email: user.email,
    //         password: user.password,
    //         lastLoggedInDate: new Date(),
    //         active: false,
    //     });
    //
    //     const userId = newUser.id;
    //     await UserAdapter.upsert({
    //         userId,
    //         adapterId,
    //     });
    //     await UserNetwork.upsert({
    //         userId,
    //         networkName: 'manual registration',
    //         networkInternalId: userId,
    //     });
    //
    //
    //     return {
    //         data: {
    //             id: newUser.id,
    //             firstName: newUser.firstName,
    //             lastName: newUser.lastName,
    //             email: newUser.email,
    //             socialNetworkKey: 'manual registration'
    //         }
    //     };
    // }

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
