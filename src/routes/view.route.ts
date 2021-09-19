import {
    Router,
    Request,
    Response,
} from 'express';
import config from '../config/config';
import serveStatic from 'serve-static';
import * as path from 'path';

export function initializeViewsRouter() {
    const router = Router();

    config.supportedClients.map((client) => {
        router.get(`/${client}`,  (req: Request, res: Response) => {
            const redirectUrl = req.query.redirect_uri;
            res.cookie('redirect_url', redirectUrl, { httpOnly: true });
            res.cookie('adapter', client, { httpOnly: true });
            res.sendFile(path.join(`${config.viewsPath}/${client}/index.html`));
        });
    });

    router.use(serveStatic(`${config.viewsPath}/`));

    return router;
}
