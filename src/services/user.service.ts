import { BaseUserDetails } from '../providers/base.interface';
import { User } from '../models/user.model';
import { UserAdapter } from '../models/adapter.model';
import { UserNetwork } from '../models/network.model';

export class UserService {
    async tryIdentifyAndUpdateUser(user: BaseUserDetails, adapterId?: string): Promise<BaseUserDetails> {
        const userExistedByEmail = await User.findOne({
            where: {
                email: user.email,
            },
        });

        let userId = null;
        console.log('isUserExist', userExistedByEmail);
        if (userExistedByEmail) {
            userId = userExistedByEmail.id;
            await userExistedByEmail.update({ lastLoggedInDate: new Date() });
        } else {
            const newUser = await User.create({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            });
            userId = newUser.id;
            console.log('Create is completed');
        }

        if (adapterId) {
            await UserAdapter.upsert({
                userId,
                adapterId,
            });
        }

        await UserNetwork.upsert({
            userId,
            networkName: user.socialNetworkKey,
            networkInternalId: user.id,
        });

        return user;
    }
}
