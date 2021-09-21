import { Router } from 'express';
import logger from '../utils/logger';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';

export enum GrantType {
    Refresh = 'refresh_token',
}

export function initializeAuthTokensRouter(
    authService: AuthService,
) {
    const router = Router();

    router.post('/token', async (req, res) => {
        try {
            const { grant_type, refresh_token, code } = req.query;
            let tokens = {};
            if (grant_type === GrantType.Refresh) {
                tokens = await authService.refreshToken(refresh_token as string);
            } else {
                tokens = await authService.initializeTokensByCode(code as string);
            }
            res.json({ ...tokens, status: 'success' });
        } catch (e) {
            logger.error('Token creation is failed', e);
            res.status(401).send();
        }
    });

    return router;
}
