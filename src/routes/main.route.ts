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

    router.get('/',  (req: Request, res: Response) => {
        res.sendFile(path.join(`${__dirname}/../views/home.html`));
    });

    router.get('/policy',  (req: Request, res: Response) => {
        res.sendFile(path.join(`${__dirname}/../views/policy.html`));
    });

    router.use(serveStatic(`${__dirname}/../views/`));
    router.use((req: Request, res: Response) => {
        res.sendFile(path.join(`${__dirname}/../views/error.html`));
    });

    return router;
}
