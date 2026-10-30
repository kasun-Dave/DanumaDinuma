import { Router } from 'express';
import * as auth from '../controllers/authController';
import { validate } from '../middleware';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, googleAuthSchema, updateProfileSchema } from '../validators';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', validate(registerSchema), auth.register);
router.post('/login', validate(loginSchema), auth.login);
router.post('/google', validate(googleAuthSchema), auth.googleAuth);
router.post('/refresh', auth.refreshToken);
router.post('/logout', auth.logout);
router.post('/forgot-password', validate(forgotPasswordSchema), auth.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), auth.resetPassword);
router.get('/me', authenticate, auth.getMe);
router.put('/profile', authenticate, validate(updateProfileSchema), auth.updateProfile);

export default router;
