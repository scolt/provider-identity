import { BaseUserDetails } from '../base.interface';
import { OauthBaseProvider } from './oauth.base.provider';

export class OauthFacebookProvider extends OauthBaseProvider {
    static key = 'facebook';
    baseUrl = 'https://www.facebook.com/v2.11/dialog/oauth';
    tokenUrl = 'https://graph.facebook.com/v2.11/oauth/access_token';
    apiUrl = 'https://graph.facebook.com/v2.11';
    scope = 'email';

    getOriginalUrl(): string {
        return `${super.getOriginalUrl()}&state=empty&v=5.64`;
    }

    getApiRequestUrl(token: string): string {
        return `${this.apiUrl}/me?&access_token=${token}&fields=id,email,first_name,last_name`;
    }

    async processUserData(userData: string): Promise<BaseUserDetails> {
        const data = JSON.parse(userData);
        return {
            id: data['id'],
            firstName: data['first_name'],
            lastName: data['last_name'],
            email: data['email'],
            socialNetworkKey: OauthFacebookProvider.key,
        };
    }
}
