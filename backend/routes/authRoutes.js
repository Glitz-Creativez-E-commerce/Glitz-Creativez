import express from 'express';
import passport from 'passport';
import {
    googleAuthCallback,
    getMe,
    updateProfile,
    toggleWishlist,
    getWishlist,
    getUsers,
    adminLogin,
    login,
    sendOTP,
    registerWithOTP,
} from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    googleAuthCallback
);

// Auth routes
router.post('/login', login);
router.post('/send-otp', sendOTP);
router.post('/register-otp', registerWithOTP);

// Admin route
router.post('/admin-login', adminLogin);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/wishlist/:productId', protect, toggleWishlist);
router.get('/wishlist', protect, getWishlist);
router.get('/admin/users', protect, admin, getUsers);

export default router;
