import { OauthBaseProvider } from './oauth.base.provider';
import { BaseUserDetails } from './base.interface';
import requestPromise from 'request-promise';

export class OauthGithubProvider extends OauthBaseProvider {
    static key = 'github';
    baseUrl = 'https://github.com/login/oauth/authorize';
    tokenUrl = 'https://github.com/login/oauth/access_token';
    apiUrl = 'https://api.github.com';
    scope = 'user:email user';

    getApiRequestUrl(token: string): string {
        return `${this.apiUrl}/user?&access_token=${token}`;
    }

    getApiEmailRequestUrl(token: string) {
        return `${this.apiUrl}/user/emails?&access_token=${token}`;
    }

    async processUserData(userData: string, tokenData: any): Promise<BaseUserDetails> {
        const emailsResponse = await requestPromise.get(
            this.getApiEmailRequestUrl(tokenData.access_token),
            this.requestOptions,
        );
        const emails = JSON.parse(emailsResponse);
        const data = JSON.parse(userData);
        const names = data.name ? data.name.split(' ') : [];
        return {
            id: data.id,
            firstName: names[0],
            lastName: names[1],
            email: emails[0].email,
            socialNetworkKey: OauthGithubProvider.key,
        };
    }
}
