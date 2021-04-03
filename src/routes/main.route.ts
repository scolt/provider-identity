import {
    Router,
    Request,
    Response,
} from 'express';
import serveStatic from 'serve-static';
import config from '../config/config';

export function initializeMainRouter() {
    const router = Router();
    const { pathname } = config;

    router.get('/',  (req: Request, res: Response) => {
        res.render('plain/.home', { pathname });
    });

    router.get('/policy',  (req: Request, res: Response) => {
        res.render('plain/.policy', { pathname });
    });


    router.use(serveStatic(`${__dirname}/../views/`));

    return router;
}
