const { env } = process;

export const config = {
    domain: env.domain || 'http://localhost:3000',
    pathname: env.pathname || '',
    port: env.port || 3000,
    viewsPath: env.viewsPath || `${__dirname}/../../views`,
    databaseUrl: env.databaseURL || '',
    mailer: {
        auth: {
            user: env.mailerAuthUser,
            pass: env.mailerAuthPass,
        },
    },

    tokenSecret: env.tokenSecret || 'must-be-changed with .env-example',
    passwordSecret: env.passwordSecret || 'must-be-changed with .env-example',
};
