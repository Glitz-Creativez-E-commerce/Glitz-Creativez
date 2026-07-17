import express from 'express';
import passport from 'passport';
import rateLimit from 'express-rate-limit';
import {
    googleAuthCallback,
    getMe,
    updateProfile,
    toggleWishlist,
    getWishlist,
    getUsers,
    adminLogin,
    login,
    verifyLoginOTP,
    resendLoginOTP,
    sendOTP,
    registerWithOTP,
} from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 20,
    message: 'Too many authentication requests, please try again later'
});

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    googleAuthCallback
);

// Auth routes
router.post('/login', authLimiter, login);
router.post('/verify-login-otp', authLimiter, verifyLoginOTP);
router.post('/resend-login-otp', authLimiter, resendLoginOTP);
router.post('/send-otp', authLimiter, sendOTP);
router.post('/register-otp', authLimiter, registerWithOTP);

// Admin route
router.post('/admin-login', authLimiter, adminLogin);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/wishlist/:productId', protect, toggleWishlist);
router.get('/wishlist', protect, getWishlist);
router.get('/admin/users', protect, admin, getUsers);

export default router;
