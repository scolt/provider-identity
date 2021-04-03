import {
    Router,
    Request,
    Response, NextFunction,
} from 'express';

import config from '../config/config';
import logger from '../utils/logger';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';

export function initializeAuthRouter(
    userService: UserService,
    authService: AuthService,
) {
    const router = Router();
    const {
        oauthProvidersConfigs,
        pathname,
    } = config;

    router.get('/', (req: Request, res: Response, next: NextFunction) => {
        const { error } = req.query;
        const adapter = req.cookies['adapter'];
        if (error && adapter) {
            res.redirect(`${pathname}/${adapter}/login?error=${error}`);
        } else {
            next();
        }
    });

    oauthProvidersConfigs.forEach((config) => {
        if (!config.key) {
            logger.error('"key" property must be provided. to "authProvidersConfigs"');
        }

        if (typeof config.provider !== 'function') {
            logger.error(`"provider" property for ${config.key} must be provided.`);
        }

        if (!config.credentials) {
            logger.error(`"credentials" property for ${config.key} must be provided.`);
        }

        const providerInstance = new config.provider(config);

        router.get(`/redirect/${config.key}`, (req: Request, res: Response) => {
            res.redirect(providerInstance.getOriginalUrl());
        });

        router.get(`/:adapter/${config.key}`, (req: Request, res: Response) => {
            const adapter = req.params['adapter'];
            const redirectUrl = req.query.redirect_uri;
            logger.debug(
                `Attempt to initialize authorization through ${config.key} for ${adapter}`,
            );
            res.cookie('redirect_url', redirectUrl, { httpOnly: true });
            res.cookie('network', config.key, { httpOnly: true });
            res.cookie('adapter', adapter, { httpOnly: true });
            res.redirect(`${pathname}/redirect/${config.key}`);
        });

        router.get(`/${config.key}/callback`, async (req, res) => {
            const { code, error } = req.query;
            const adapter = req.cookies['adapter'];

            if (error || !code) {
                logger.debug(
                    `Code receiving is failed from ${config.key} for ${adapter}. ${error}`,
                );
                res.redirect(`${pathname}/${adapter}/login?error=${error}`);
                return;
            }

            logger.debug(`Code successfully received from ${config.key} for ${adapter}`);

            let userDetails;
            try {
                userDetails = await providerInstance.authenticate(<string>code);
                await userService.tryIdentifyAndUpdateUser(userDetails, adapter);
                const identityCode = await authService.generateCodeByUser(userDetails);
                if (!req.cookies.redirect_url) {
                    throw new Error('Redirect URL is undefined');
                }
                res.redirect(`${req.cookies.redirect_url}?code=${identityCode}`);
            } catch (userDetailsError) {
                logger.debug(`Authentication is failed from ${config.key} for ${adapter}. ${userDetailsError}`);
                res.redirect(`${pathname}/${adapter}/login?error=authentication_error`);
                return;
            }
        });

    });

    return router;
}
