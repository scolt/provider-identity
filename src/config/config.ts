import { OauthFacebookProvider } from '../providers/oauth.facebook.provider';
import { OauthGithubProvider } from '../providers/oauth.github.provider';

export default {
    port: process.env.port || 3000,
    domain: process.env.domain || 'http://localhost:3000',
    pathname: process.env.pathname || '',
    databaseUrl: process.env.databaseURL || 'mysql://identity_admin:identity_admin1@localhost:3306/provider_identity',
    supportedClients: ['ivwa'],
    authTokenSecretKey: '-1et$Try2ctrlvO0+!lie--itisnotrandom-15462',
    oauthProvidersConfigs: [{
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
    }],
};