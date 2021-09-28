import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import { config as dotenv } from 'dotenv';
dotenv();

import { urlencoded, json } from 'body-parser';
import { config } from './config';

import { Database } from './database/database';
import { User } from './models/user.model';
import { UserNetwork } from './models/network.model';
import { UserAdapter } from './models/user.adapter.model';
import { UserToken } from './models/token.model';

import { initializeViewsRouter } from './routes/view.route';
import { initializeAuthTokensRouter } from './routes/auth.tokens.route';
import { initializeAuthOAuthRouter } from './routes/auth.oauth.route';
import { initializeAuthSimpleRouter } from './routes/auth.simple.route';
import { initializeMainRouter } from './routes/main.route';
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';
import logger from './utils/logger';
import { Adapter } from './models/adapter.model';

const userService = new UserService();
const authService = new AuthService();

function estabilishMiddlewares(app: Express) {
    app.use(urlencoded({ extended: true }));
    app.use(json());
    app.use(cookieParser());
}

function establishViewEngine(app: Express) {
    app.set('views', `${__dirname}/views`);
    app.set('view engine', 'pug');
}

async function establishRoutes(app: Express) {
    const routes = [
        initializeAuthOAuthRouter.bind(null, userService, authService),
        initializeAuthSimpleRouter.bind(null, userService, authService),
        initializeAuthTokensRouter.bind(null, authService),
        initializeViewsRouter,
        initializeMainRouter,
    ];

    for (const initializeRoute of routes) {
        app.use(config.pathname, await initializeRoute());
    }
}

async function establishDatabase() {
    const db = new Database({
        connectionUrl: config.databaseUrl,
    });

    db.connect();
    logger.info(`Database connection established via ${config.databaseUrl}`);
    try {
        await db.initModels([Adapter, User, UserNetwork, UserAdapter, UserToken]);
    } catch (e) {
        logger.error('Error while sync database and models', e);
    }
}

async function startApplication() {
    const app = express();

    await establishDatabase();
    estabilishMiddlewares(app);
    establishViewEngine(app);
    await establishRoutes(app);

    app.listen(config.port, () => {
        const splitDomain = config.domain.split(':');
        const domainWithoutPort = splitDomain[0] + splitDomain[1];
        logger.info(`Identity provider: ${domainWithoutPort}${config.pathname}:${config.port}`);
    });
}

startApplication();
