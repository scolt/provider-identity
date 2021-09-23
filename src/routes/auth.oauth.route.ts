import { NextFunction, Request, Response, Router } from 'express';

import { config, oauthProvidersConfigs } from '../config';
import logger from '../utils/logger';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { ErrorMessages } from '../utils/errors';

export function initializeAuthOAuthRouter(
    userService: UserService,
    authService: AuthService,
) {
    const router = Router();
    const { pathname } = config;

    router.get('/', (req: Request, res: Response, next: NextFunction) => {
        const { error } = req.query;
        const adapter = req.cookies['adapter'];
        if (error && adapter) {
            res.redirect(`${pathname}/${adapter}?error=${error}`);
        } else {
            next();
        }
    });

    oauthProvidersConfigs.forEach((config) => {
        if (!config.key) {
            logger.error('"key" property must be provided. to "authProvidersConfigs"');
            return;
        }

        if (typeof config.provider !== 'function') {
            logger.error(`"provider" property for ${config.key} must be provided.`);
            return;
        }

        if (!config.credentials) {
            logger.error(`"credentials" property for ${config.key} must be provided.`);
            return;
        }

        const providerInstance = new config.provider(config);

        router.get(`/redirect/${config.key}`, (req: Request, res: Response) => {
            res.redirect(providerInstance.getOriginalUrl());
        });

        router.get(`/oauth/${config.key}`, (req: Request, res: Response) => {
            const adapter = req.cookies['adapter'];
            const redirectUrl = req.cookies['redirect_url'];
            logger.debug(
                `Attempt to initialize authorization through ${config.key} for ${adapter}.`,
            );
            if (!redirectUrl) {
                res.redirect(`${pathname}/${adapter}?error=${ErrorMessages.NO_REDIRECT_URL}`);
            } else {
                res.cookie('network', config.key, { httpOnly: true });
                res.redirect(`${pathname}/redirect/${config.key}`);
            }

        });

        router.get(`/${config.key}/callback`, async (req, res) => {
            const { code, error } = req.query;
            const { adapter, redirect_url } = req.cookies;

            if (error || !code) {
                logger.debug(
                    `Code receiving is failed from ${config.key} for ${adapter}. ${error}`,
                );
                res.redirect(`${pathname}/${adapter}?error=${error}`);
                return;
            }

            logger.debug(`Code successfully received from ${config.key} for ${adapter}`);

            let userDetails;
            try {
                userDetails = await providerInstance.authenticate(<string>code);
                await userService.tryIdentifyAndUpdateUser(userDetails, adapter);
                const identityCode = authService.generateCodeByUser(userDetails);
                if (!redirect_url) {
                    throw new Error('Redirect URL is undefined');
                }
                res.redirect(`${redirect_url}?code=${identityCode}`);
            } catch (userDetailsError) {
                logger.debug(`Authentication is failed from ${config.key} for ${adapter}. ${userDetailsError}`);
                res.redirect(`${pathname}/${adapter}?error=authentication_error`);
                return;
            }
        });
    });

    return router;
}
