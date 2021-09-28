import * as path from 'path';
import { Router, Request, Response } from 'express';
import serveStatic from 'serve-static';

import { config } from '../config';
import { Adapter } from '../models/adapter.model';
import { ErrorMessages } from '../utils/errors';

export async function initializeViewsRouter(): Promise<Router> {
    const router = Router();

    const adapters = await Adapter.findAll();
    adapters.map(({ adapterName, redirectUrls }) => {
        router.get(`/${adapterName}`, (req: Request, res: Response) => {
            const redirectUrl: string = req.query.redirect_uri as string;
            const isAvailableUrl = !!redirectUrls.split(',').find(url => redirectUrl?.indexOf(url) === 0);

            if (!isAvailableUrl) {
                res.redirect(`${redirectUrl}?error=${ErrorMessages.NO_REGISTERED_REDIRECT_URL}`);
                return;
            }

            if (redirectUrl) {
                res.cookie('redirect_url', redirectUrl, { httpOnly: true });
            }

            res.cookie('adapter', adapterName, { httpOnly: true });
            res.sendFile(path.join(`${config.viewsPath}/${adapterName}/index.html`));
        });
    });

    router.use(
        serveStatic(`${config.viewsPath}/`, {
            index: false,
        }),
    );

    return router;
}
