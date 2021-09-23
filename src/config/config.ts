import fs from 'fs';
import path from 'path';

const { env } = process;

export const config = {
    domain: env.domain || 'http://localhost:3000',
    pathname: env.pathname || '',
    port: env.port || 3000,
    viewsPath: env.viewsPath || `${__dirname}/../../views`,
    databaseUrl: env.databaseURL || '',
    supportedClients: env.supportedClients ? env.supportedClients.split(',') : [],
    mailer: {
        auth: {
            user: env.mailerAuthUser,
            pass: env.mailerAuthPass,
        },
    },

    privateKey: env.privateKeyPath ? fs.readFileSync(path.normalize(env.privateKeyPath), 'utf8') : '',
    publicKey: env.publicKeyPath ? fs.readFileSync(path.normalize(env.publicKeyPath), 'utf8') : '',
    tokenSecret: env.tokenSecret || 'must-be-changed with .env',
    passwordSecret: env.passwordSecret || 'must-be-changed with .env',
};
