import express, { Express } from 'express';
import vars from './config/vars';

import { Database } from './database/database';
import { modelUserConfig } from './models/user.model';
import { initializeViewsRouter } from './routes/view.route';

function establishViewEngine(app: Express) {
    app.set('views', `${__dirname}/views`);
    app.set('view engine', 'pug');
}

function establishRoutes(app: Express) {
    const routes = [
        initializeViewsRouter,
    ];
    routes.map((initializeRoute) => {
        app.use(initializeRoute());
    });
}

async function establishDatabase() {
    const db = new Database({
        connectionUrl: vars.databaseUrl,
    });

    db.connect();
    await db.initModels([
        modelUserConfig,
    ]);
}

async function startApplication() {
    const app = express();

    await establishDatabase();
    establishViewEngine(app);
    establishRoutes(app);

    app.listen(3000, () => {
        console.log('Identity provider listening on port 3000!');
    });
}

startApplication();
