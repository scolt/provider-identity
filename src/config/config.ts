import fs from 'fs';

export const config = {
    domain: process.env.domain || 'http://localhost:3000',
    pathname: process.env.pathname || '',
    port: process.env.port || 3000,
    viewsPath: process.env.viewsPath || `${__dirname}/../../views`,
    databaseUrl: process.env.databaseURL || 'mysql://identity_admin:identity_admin1@localhost:3306/provider_identity',

    supportedClients: ['ivwa'],
    mailer: {
        auth: {
            user: 'yellow.bat.identity.provider@gmail.com',
            pass: 'bat.pro.ip2021',
        },
    },

    privateKey: process.env.privateKey || fs.readFileSync(`${__dirname}/../../keys/identity`),
    publicKey: process.env.privateKey || fs.readFileSync(`${__dirname}/../../keys/identity.pub`),
    passwordSecret: 'realStrangePassword',
};
