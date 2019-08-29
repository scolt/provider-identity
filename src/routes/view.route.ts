import {
    Router,
    Request,
    Response,
} from 'express';
import vars from '../config/vars';
import serveStatic from 'serve-static';

export function initializeViewsRouter() {
    const router = Router();

    router.get('/:adapter/login',  (req: Request, res: Response) => {
        const adapterId: string = req.params['adapter'] || '';
        const redirectUrl: string = req.query['redirect_url'] || 'hello';
        const isAvailableClient = vars.supportedClients.indexOf(adapterId.toLowerCase()) > -1;
        if (isAvailableClient) {
            res.render(`${adapterId}/.login`, {
                adapterId,
                redirectUrl,
            });
        } else {
            res.send('This client is not supported by current platform, please contact with your administrator.');
        }
    });

    router.use(serveStatic(`${__dirname}/../views/`));

    return router;
}
