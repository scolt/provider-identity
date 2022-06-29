import { Router } from 'express';
import logger from '../utils/logger';
import { AuthService, TokensSet } from '../services/auth.service';

export enum GrantType {
    Refresh = 'refresh_token',
}

export function initializeAuthTokensRouter(authService: AuthService): Router {
    const router = Router();

    router.get('/cc', async (req, res) => {
        const code = authService.generateCodeByUser({
            id: 'test-id',
            email: 'test-email@com.com',
            firstName: 'Test',
            lastName: 'User',
        });

        res.send(code);
    });

    router.post('/token', async (req, res) => {
        try {
            const { grant_type, refresh_token, code, adapter } = req.query;
            let tokens: TokensSet;

            if (!adapter) {
                throw new Error('Adapter is required.');
            }

            if (grant_type === GrantType.Refresh) {
                tokens = await authService.refreshToken(refresh_token as string, adapter as string);
            } else {
                tokens = await authService.initializeTokensByCode(code as string, adapter as string);
            }

            res.json({ ...tokens, status: 'success' });
        } catch (e) {
            logger.error('Token creation is failed', e);
            res.status(401).send();
        }
    });

    return router;
}
