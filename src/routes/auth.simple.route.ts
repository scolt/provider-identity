import { Router } from 'express';

import logger from '../utils/logger';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { AuthSimpleProvider } from '../providers/simple/simple.provider';
import { EmailService } from '../services/email.service';

export function initializeAuthSimpleRouter(
    userService: UserService,
    authService: AuthService,
) {
    const router = Router();

    const emailService = new EmailService();
    const simple = new AuthSimpleProvider(emailService);

    router.post('/validate', async (req, res) => {
        const redirectUrl = req.cookies['redirect_url'];
        const registrationErrors = await simple.getRegistrationDataError(req.body);
        const isError = Object.values(registrationErrors).length;
        if (isError) {
            res.status(400).json({
                status: 'validation-error',
                errors: registrationErrors,
            });
            return;
        }
        try {
            await simple.sendCodeBasedOnDetails(req.body, redirectUrl);
            res.json({ status: 'success' });
        } catch (e) {
            logger.error('Unable to send the registration code:', e);
            res.status(500).json({ status: 'failed' });
        }
    });

    router.post('/sign-in', async (req, res) => {
        try {
            const userDetails = await simple.getUserDetailsByCredentials(req.body);
            const identityCode = authService.generateCodeByUser(userDetails);

            res.json({
                status: 'success' ,
                url: `${req.cookies.redirect_url}?code=${identityCode}` },
            );
        } catch (e) {
            logger.error('Sign in failed', e);
            res.status(400).json({ status: 'failed', error: 'Credentials are invalid.' });
        }
    });

    router.post('/register', async (req, res) => {
        try {
            const config = await simple.validateCodeAndReturnConfig(req.body.code);
            const userDetails = await userService.tryIdentifyAndUpdateUser(
                config.details,
                req.cookies['adapter'],
            );
            const identityCode = authService.generateCodeByUser(userDetails);

            res.json({
                status: 'success' ,
                url: `${req.cookies.redirect_url}?code=${identityCode}` },
            );
        } catch (e) {
            logger.error('Registration failed', e);
            res.status(400).json({ status: 'failed', error: 'Code is invalid!' });
        }
    });

    return router;
}
