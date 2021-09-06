import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import config from './config/config';

import { Database } from './database/database';
import { User } from './models/user.model';
import { UserNetwork } from './models/network.model';
import { UserAdapter } from './models/adapter.model';
import { initializeViewsRouter } from './routes/view.route';
import { initializeAuthRouter } from './routes/auth.route';
import { initializeMainRouter } from './routes/main.route';
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';
import logger from './utils/logger';
import bodyParser from 'body-parser';

const userService = new UserService();
const authService = new AuthService();

function estabilishMiddlewares(app: Express) {
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(cookieParser());
}

function establishViewEngine(app: Express) {
    app.set('views', `${__dirname}/views`);
    app.set('view engine', 'pug');
}

function establishRoutes(app: Express) {
    const routes = [
        initializeAuthRouter.bind(null, userService, authService),
        initializeViewsRouter,
        initializeMainRouter,
    ];
    routes.map((initializeRoute) => {
        app.use(config.pathname, initializeRoute());
    });
}

async function establishDatabase() {
    const db = new Database({
        connectionUrl: config.databaseUrl,
    });

    db.connect();
    logger.info(`Database connection established via ${config.databaseUrl}`);
    try {
        await db.initModels([
            User,
            UserNetwork,
            UserAdapter,
        ]);
    } catch (e) {
        logger.error('Error while sync database and models', e);
    }

}

async function startApplication() {
    const app = express();

    await establishDatabase();
    estabilishMiddlewares(app);
    establishViewEngine(app);
    establishRoutes(app);

    app.listen(config.port, () => {
        const splitDomain = config.domain.split(':');
        const domainWithoutPort = splitDomain[0] + splitDomain[1];
        logger.info(`Identity provider: ${domainWithoutPort}${config.pathname}:${config.port}`);
    });
}

startApplication();
