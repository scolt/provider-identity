import { NextFunction, Request, Response, Router } from 'express';

import config from '../config/config';
import logger from '../utils/logger';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { AuthSimpleProvider } from '../providers/simple/simple.provider';
import { EmailService } from '../services/email.service';

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
            logger.debug(
                `Attempt to initialize authorization through ${config.key} for ${adapter}.`,
            );
            res.cookie('network', config.key, { httpOnly: true });
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

    const emailService = new EmailService();
    const simple = new AuthSimpleProvider(emailService);
    router.post('/validate', async (req, res) => {
        const redirectUrl = req.cookies['redirect_url'];
        const registrationErrors = await simple.getRegistrationDataError(req.body);
        const isError = Object.values(registrationErrors).length;
        if (isError) {
            res.json({
                status: 'validation-error',
                errors: registrationErrors,
            });
            return;
        }

        const isCodeSent = await simple.sendCodeBasedOnDetails(req.body, redirectUrl);
        res.json({ status: isCodeSent ? 'success' : 'failed' });
    });

    router.post('/register', async (req, res) => {
        try {
            const config = await simple.validateCodeAndReturnConfig(req.body.code);
            const userDetails = await userService.tryIdentifyAndUpdateUser(
                config.details,
                req.cookies['adapter'],
            );
            const identityCode = await authService.generateCodeByUser(userDetails);

            res.json({
                status: 'success' ,
                url: `${req.cookies.redirect_url}?code=${identityCode}` },
            );
        } catch (e) {
            logger.error('Registration failed', e);
            res.json({ status: 'failed', error: 'Code is invalid!' });
        }
    });

    // router.post('/:adapter/register', async (req, res) => {
    //     const redirectUrl = req.body['redirect_url'];
    //     const result = await userService.tryRegisterUser(req.body, req.params.adapter);
    //     if (result.data) {
    //         const identityCode = await authService.generateCodeByUser(result.data);
    //         res.redirect(`${redirectUrl}?code=${identityCode}`);
    //     } else {
    //         res.send(result);
    //     }
    // });
    //
    // router.post('/:adapter/sign-in', async (req, res) => {
    //     const redirectUrl = req.body['redirect_url'];
    //     try {
    //         const { err, data } = await userService.trySignInUser(req.body, req.params.adapter);
    //         if (data) {
    //             const identityCode = await authService.generateCodeByUser(data);
    //             res.redirect(`${redirectUrl}?code=${identityCode}`);
    //         } else {
    //             res.send(err);
    //         }
    //     } catch(e) {
    //         res.send('Беда...')
    //     }
    //
    // });

    return router;
}
