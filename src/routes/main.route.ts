import { Router, Request, Response } from 'express';
import serveStatic from 'serve-static';
import path from 'path';

import { config } from '../config';

export function initializeMainRouter(): Router {
    const router = Router();

    router.get('/', (req: Request, res: Response) => {
        res.sendFile(path.join(`${__dirname}/../views/home.html`));
    });

    router.get('/policy', (req: Request, res: Response) => {
        res.sendFile(path.join(`${__dirname}/../views/policy.html`));
    });

    router.get('/error', (req: Request, res: Response) => {
        res.sendFile(path.join(`${__dirname}/../views/error.html`));
    });

    router.use(serveStatic(`${__dirname}/../views/`));
    router.use((req: Request, res: Response) => {
        res.redirect(`${config.pathname}/error`);
    });

    return router;
}
