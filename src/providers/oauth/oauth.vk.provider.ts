import { OauthBaseProvider } from './oauth.base.provider';
import { AuthProviderConfig, BaseUserDetails } from '../base.interface';

export class OauthVkProvider extends OauthBaseProvider {
    static key = 'vk';
    baseUrl = 'https://oauth.vk.com/authorize';
    tokenUrl = 'https://oauth.vk.com/access_token';
    apiUrl = 'https://api.vk.com/method';
    scope = 'email';

    getOriginalUrl() {
        return `${super.getOriginalUrl()}&v=5.64`;
    }

    getApiRequestUrl(token: string): string {
        return `${this.apiUrl}/users.get?&access_token=${token}&v=5.64`;
    }

    async processUserData(userData: string, tokenData: any): Promise<BaseUserDetails> {
        const data = JSON.parse(userData).response[0];
        return {
            id: data['id'],
            firstName: data['first_name'],
            lastName: data['last_name'],
            email: tokenData['email'],
            socialNetworkKey: OauthVkProvider.key,
        };
    }
}
