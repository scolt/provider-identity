import {
    Router,
    Request,
    Response,
} from 'express';
import serveStatic from 'serve-static';
import { config } from '../config';
import path from 'path';

export function initializeMainRouter() {
    const router = Router();
    const { pathname } = config;

    router.get('/',  (req: Request, res: Response) => {
        res.sendFile(path.join(`${__dirname}/../views/plain/home.html`));
    });

    router.get('/policy',  (req: Request, res: Response) => {
        res.sendFile(path.join(`${__dirname}/../views/plain/policy.html`));
    });

    router.use(serveStatic(`${__dirname}/../views/`));
    router.use((req: Request, res: Response) => {
        res.sendFile(path.join(`${__dirname}/../views/plain/error.html`));
    });

    return router;
}
