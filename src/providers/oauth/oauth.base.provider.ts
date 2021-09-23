import {
    AuthProviderConfig,
    BaseUserDetails,
    TokenData,
} from '../base.interface';

import requestPromise, { RequestPromiseOptions } from 'request-promise';
import { config } from '../../config';
import { DEFAULT_AGENT, generateQueryParamsByObj } from '../../utils/url';
import logger from '../../utils/logger';

export abstract class OauthBaseProvider {
    config: AuthProviderConfig;
    requestOptions: RequestPromiseOptions;
    baseUrl = '';
    tokenUrl = '';
    apiUrl = '';
    scope = '';

    constructor(authConfig: AuthProviderConfig) {
        this.config = authConfig;
        this.requestOptions = {
            headers: {
                Accept: 'application/json',
                'User-Agent': DEFAULT_AGENT,
            },
        };
    }

    abstract getApiRequestUrl(token: string): string;
    abstract processUserData(userData: string, tokenData?: TokenData): Promise<BaseUserDetails>;

    getRequestOptions(value?: string) {
        return this.requestOptions;
    }

    getOriginalUrl() {
        const query = generateQueryParamsByObj({
            client_id: this.config.credentials.clientId,
            display: 'page',
            response_type: 'code',
            redirect_uri: encodeURIComponent(
                `${config.domain}${config.pathname}/${this.config.key}/callback`,
            ),
            scope: this.scope,
        });
        return `${this.baseUrl}${query}`;
    }

    getAuthRequestUrl(code: string): string {
        const query = generateQueryParamsByObj({
            code,
            client_id: this.config.credentials.clientId,
            client_secret: this.config.credentials.secret,
            redirect_uri: encodeURIComponent(
                `${config.domain}${config.pathname}/${this.config.key}/callback`,
            ),
            grant_type: 'authorization_code',
        });

        return `${this.tokenUrl}${query}`;
    }

    async authenticate(code: string): Promise<BaseUserDetails> {
        const responseAuth = await requestPromise.get(
            this.getAuthRequestUrl(code),
            this.requestOptions,
        );
        const parsedResponseAuth = JSON.parse(responseAuth);
        if (parsedResponseAuth.error || !parsedResponseAuth.access_token) {
            throw new Error(parsedResponseAuth.error);
        } else {
            const userDetails = await requestPromise.get(
                this.getApiRequestUrl(parsedResponseAuth.access_token),
                this.getRequestOptions(parsedResponseAuth.access_token),
            );
            return this.processUserData(userDetails, parsedResponseAuth);
        }
    }
}
