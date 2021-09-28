import requestPromise, { RequestPromiseOptions } from 'request-promise';
import { BaseUserDetails, TokenData } from '../base.interface';
import { OauthBaseProvider } from './oauth.base.provider';

export class OauthGithubProvider extends OauthBaseProvider {
    static key = 'github';
    baseUrl = 'https://github.com/login/oauth/authorize';
    tokenUrl = 'https://github.com/login/oauth/access_token';
    apiUrl = 'https://api.github.com';
    scope = 'user:email user';

    getCustomRequestOptions = (token: string): RequestPromiseOptions => {
        return {
            ...this.defaultRequestOptions,
            headers: {
                ...this.defaultRequestOptions.headers,
                Authorization: `token ${token}`,
            },
        };
    };

    getApiRequestUrl(token: string): string {
        return `${this.apiUrl}/user?&access_token=${token}`;
    }

    getApiEmailRequestUrl(token: string): string {
        return `${this.apiUrl}/user/emails?&access_token=${token}`;
    }

    async processUserData(userData: string, tokenData: TokenData): Promise<BaseUserDetails> {
        const emailsResponse = await requestPromise.get(
            this.getApiEmailRequestUrl(tokenData.access_token),
            this.getCustomRequestOptions(tokenData.access_token),
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
