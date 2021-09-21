import { OauthFacebookProvider } from '../providers/oauth/oauth.facebook.provider';
import { OauthGithubProvider } from '../providers/oauth/oauth.github.provider';
import { OauthVkProvider } from '../providers/oauth/oauth.vk.provider';

export const oauthProvidersConfigs = [{
    key: OauthFacebookProvider.key,
    provider: OauthFacebookProvider,
    credentials: {
        clientId: '473945003449311',
        secret: '6de1162293e5f43c87fb1972ec91b78b',
    },
}, {
    key: OauthGithubProvider.key,
    provider: OauthGithubProvider,
    credentials: {
        clientId: '7a33fc23ab100c0137f1',
        secret: '2dede644804288a4aee3d7c1ee5b85fbc37698ba',
    },
}, {
    key: OauthVkProvider.key,
    provider: OauthVkProvider,
    credentials: {
        clientId: '7812199',
        secret: 'ltOvR8YT8fZaJels2pGy',
    },
}];
