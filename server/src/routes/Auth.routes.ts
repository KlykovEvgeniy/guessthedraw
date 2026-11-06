import { Router } from 'express';
import { reg, act, log, googleCallback, profile, logout, refresh } from '../controllers';
import passport from 'passport'
import { config } from 'dotenv';
import { isAuth } from '../middlewares';
config();

const router = Router();
router.post('/api/v1.0.0/auth/register', reg);
router.get('/api/v1.0.0/auth/activate/:token', act);
router.post('/api/v1.0.0/auth/login', log);
router.post('/api/v1.0.0/auth/logout', isAuth, logout);
router.get("/api/v1.0.0/auth/google", passport.authenticate('google', { scope: ["profile", "email"], session: false }));
router.get('/api/v1.0.0/auth/google/callback', passport.authenticate("google", { failureRedirect: '/auth-error', session: false }), (req, res) => googleCallback(req, res));
router.get('/api/v1.0.0/auth/profile', isAuth, profile);
router.get('/api/v1.0.0/auth/refresh', refresh);

export default router;
