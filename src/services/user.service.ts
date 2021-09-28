import { BaseUserDetails } from '../providers/base.interface';
import { User } from '../models/user.model';
import { UserAdapter } from '../models/user.adapter.model';
import { UserNetwork } from '../models/network.model';
import logger from '../utils/logger';
import { Adapter } from '../models/adapter.model';

export interface ValidationMap {
    [key: string]: string;
}

export interface RegisteredUserData {
    err?: ValidationMap;
    data?: BaseUserDetails;
}

export class UserService {
    async tryIdentifyAndUpdateUser(user: BaseUserDetails, adapterName: string): Promise<BaseUserDetails> {
        const userExistedByEmail = await User.findOne({
            where: {
                email: user.email,
            },
        });

        let userId: string;
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
            logger.info(`User for ${adapterName} has been created. ${user.firstName} ${user.lastName}`);
        }

        if (adapterName) {
            const { adapterId } = (await Adapter.findOne({ where: { adapterName } })) || {};

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
