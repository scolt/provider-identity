import { OauthFacebookProvider } from '../providers/oauth/oauth.facebook.provider';
import { OauthGithubProvider } from '../providers/oauth/oauth.github.provider';
import { OauthVkProvider } from '../providers/oauth/oauth.vk.provider';

const { env } = process;

export const oauthProvidersConfigs = [
    {
        key: OauthFacebookProvider.key,
        provider: OauthFacebookProvider,
        credentials: {
            clientId: env.facebookCid || '',
            secret: env.facebookSecret || '',
        },
    },
    {
        key: OauthGithubProvider.key,
        provider: OauthGithubProvider,
        credentials: {
            clientId: env.githubCid || '',
            secret: env.githubSecret || '',
        },
    },
    {
        key: OauthVkProvider.key,
        provider: OauthVkProvider,
        credentials: {
            clientId: env.vkCid || '',
            secret: env.vkSecret || '',
        },
    },
];
