import {
    Router,
    Request,
    Response,
} from 'express';
import serveStatic from 'serve-static';

export function initializeMainRouter() {
    const router = Router();

    router.get('/',  (req: Request, res: Response) => {
        res.render('plain/.home');
    });

    router.get('/policy',  (req: Request, res: Response) => {
        res.render('plain/.policy');
    });


    router.use(serveStatic(`${__dirname}/../views/`));

    return router;
}
