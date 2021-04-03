import {
    Router,
    Request,
    Response,
} from 'express';
import config from '../config/config';
import serveStatic from 'serve-static';

export function initializeViewsRouter() {
    const router = Router();

    router.get('/:adapter/login',  (req: Request, res: Response) => {
        const adapterId = <string>req.params['adapter'] || '';
        const redirectUrl= <string>req.query['redirect_uri'] || 'https://webtech.by';
        const { pathname } = config;
        const isAvailableClient = config.supportedClients.indexOf(adapterId.toLowerCase()) > -1;
        if (isAvailableClient) {
            res.render(`${adapterId}/.login`, {
                pathname,
                adapterId,
                redirectUrl,
            });
        } else {
            res.render('plain/.errorNotSupportedClient', { test: true });
        }
    });

    router.use(serveStatic(`${__dirname}/../views/`));

    return router;
}
