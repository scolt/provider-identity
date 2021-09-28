import requestPromise, { RequestPromiseOptions } from 'request-promise';
import { AuthProviderConfig, BaseUserDetails, TokenData } from '../base.interface';

import { config } from '../../config';
import { DEFAULT_AGENT, generateQueryParamsByObj } from '../../utils/url';

export abstract class OauthBaseProvider {
    config: AuthProviderConfig;
    defaultRequestOptions: RequestPromiseOptions;
    getCustomRequestOptions: (token: string) => RequestPromiseOptions;
    baseUrl = '';
    tokenUrl = '';
    apiUrl = '';
    scope = '';

    constructor(authConfig: AuthProviderConfig) {
        this.config = authConfig;
        this.defaultRequestOptions = {
            headers: {
                Accept: 'application/json',
                'User-Agent': DEFAULT_AGENT,
            },
        };
    }

    abstract getApiRequestUrl(token: string): string;
    abstract processUserData(userData: string, tokenData?: TokenData): Promise<BaseUserDetails>;
    abstract processUserData(userData: string, tokenData?: TokenData): Promise<BaseUserDetails>;

    getOriginalUrl(): string {
        const query = generateQueryParamsByObj({
            client_id: this.config.credentials.clientId,
            display: 'page',
            response_type: 'code',
            redirect_uri: encodeURIComponent(`${config.domain}${config.pathname}/${this.config.key}/callback`),
            scope: this.scope,
        });
        return `${this.baseUrl}${query}`;
    }

    getAuthRequestUrl(code: string): string {
        const query = generateQueryParamsByObj({
            code,
            client_id: this.config.credentials.clientId,
            client_secret: this.config.credentials.secret,
            redirect_uri: encodeURIComponent(`${config.domain}${config.pathname}/${this.config.key}/callback`),
            grant_type: 'authorization_code',
        });

        return `${this.tokenUrl}${query}`;
    }

    async authenticate(code: string): Promise<BaseUserDetails> {
        const responseAuth = await requestPromise.get(this.getAuthRequestUrl(code), this.defaultRequestOptions);
        const parsedResponseAuth = JSON.parse(responseAuth);
        if (parsedResponseAuth.error || !parsedResponseAuth.access_token) {
            throw new Error(parsedResponseAuth.error);
        } else {
            const options = this.getCustomRequestOptions
                ? this.getCustomRequestOptions(parsedResponseAuth.access_token)
                : this.defaultRequestOptions;

            const userDetails = await requestPromise.get(
                this.getApiRequestUrl(parsedResponseAuth.access_token),
                options,
            );
            return this.processUserData(userDetails, parsedResponseAuth);
        }
    }
}
