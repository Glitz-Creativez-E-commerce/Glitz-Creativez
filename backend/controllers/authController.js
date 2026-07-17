import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Product from '../models/Product.js';
import OTP from '../models/OTP.js';
import generateToken from '../utils/generateToken.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { sendBrevoEmail } from '../utils/brevo.js';


// @desc    Handle Google Auth Callback
// @route   GET /api/auth/google/callback
// @access  Public
export const googleAuthCallback = asyncHandler(async (req, res) => {
    // Passport attaches the authenticated user to req.user
    if (!req.user) {
        res.status(401);
        throw new Error('Authentication failed');
    }

    const token = generateToken(req.user._id);

    // Redirect to frontend with token in query params or set cookie
    // Since this is a vibe-coded React SPA, we'll redirect with token
    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    res.redirect(`${frontendUrl}/auth/success?token=${token}`);
});

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('wishlist');

    if (user) {
        res.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                address: user.address,
                wishlist: user.wishlist,
                isAdmin: user.isAdmin,
                createdAt: user.createdAt,
            },
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
    const { name, email, avatar, address, notifications } = req.body;

    const user = await User.findById(req.user._id);

    if (user) {
        user.name = name || user.name;
        user.email = email || user.email;
        user.avatar = avatar || user.avatar;

        if (address) {
            user.address = { ...user.address, ...address };
        }

        if (notifications) {
            user.notifications = { ...user.notifications, ...notifications };
        }

        const updatedUser = await user.save();

        res.json({
            success: true,
            data: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                avatar: updatedUser.avatar,
                address: updatedUser.address,
                notifications: updatedUser.notifications,
                isAdmin: updatedUser.isAdmin,
                createdAt: updatedUser.createdAt,
                token: generateToken(updatedUser._id),
            },
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Toggle wishlist item
// @route   POST /api/auth/wishlist/:productId
// @access  Private
export const toggleWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        res.status(400);
        throw new Error('Invalid Product ID');
    }

    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Check if product exists in wishlist using string comparison
    const isAlreadyInWishlist = user.wishlist && user.wishlist.some(
        (id) => id && id.toString() === productId
    );

    const update = isAlreadyInWishlist
        ? { $pull: { wishlist: productId } }
        : { $addToSet: { wishlist: productId } };

    // Atomically update user wishlist
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        update,
        { new: true }
    );

    if (!updatedUser) {
        res.status(404);
        throw new Error('Could not update user');
    }

    // Try to populate wishlist for the response, but fall back to raw IDs if it fails
    let wishlistToReturn = updatedUser.wishlist;
    try {
        const populatedUser = await User.findById(req.user._id).populate('wishlist');
        if (populatedUser) {
            wishlistToReturn = populatedUser.wishlist;
        }
    } catch (populateError) {
        console.error('[Populate Error] Failed to populate wishlist:', populateError);
        // We still have the raw IDs in wishlistToReturn, so we can continue
    }

    res.json({
        success: true,
        data: wishlistToReturn,
        message: isAlreadyInWishlist ? 'Removed from wishlist' : 'Added to wishlist',
    });
});

// @desc    Get wishlist
// @route   GET /api/auth/wishlist
// @access  Private
export const getWishlist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('wishlist');

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    res.json({
        success: true,
        data: user.wishlist,
    });
});
// @desc    Get all users (Admin)
// @route   GET /api/auth/admin/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.json({ success: true, data: users });
});

// @desc    Admin login
// @route   POST /api/auth/admin-login
// @access  Public
export const adminLogin = asyncHandler(async (req, res) => {
    const email = req.body.email ? req.body.email.trim() : '';
    const { password } = req.body;

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@example.com').trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // 1. Check if it matches the environment variable hardcoded override first
    const isEnvMatch = email.toLowerCase() === adminEmail.toLowerCase() && password === adminPassword;

    let adminUser = null;
    let isAuthenticated = false;

    if (isEnvMatch) {
        isAuthenticated = true;
        // Find or create admin user in DB to attach an ID to the JWT
        adminUser = await User.findOne({ email: { $regex: new RegExp('^' + email.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i') } });

        if (!adminUser) {
            adminUser = await User.create({
                email,
                name: 'System Administrator',
                isAdmin: true,
                googleId: 'admin_override_' + Date.now(), // satisfy required googleId
            });
        } else if (!adminUser.isAdmin) {
            adminUser.isAdmin = true;
            await adminUser.save();
        }
    } else {
        // 2. Fallback: Check if there is an Admin User in the DB with this email and matching hashed password
        adminUser = await User.findOne({ email: { $regex: new RegExp('^' + email.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i') } });
        
        if (adminUser && adminUser.isAdmin && adminUser.password) {
            const isPasswordMatch = await bcrypt.compare(password, adminUser.password);
            if (isPasswordMatch) {
                isAuthenticated = true;
            }
        }
    }

    if (isAuthenticated && adminUser) {
        res.json({
            success: true,
            data: {
                _id: adminUser._id,
                name: adminUser.name,
                email: adminUser.email,
                isAdmin: true,
                token: generateToken(adminUser._id),
            },
        });
    } else {
        res.status(401);
        throw new Error('Invalid credentials'); // Privacy-first message
    }
});

// @desc    User Login
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
    const email = req.body.email ? req.body.email.trim() : '';
    const { password } = req.body;

    const user = await User.findOne({ email: { $regex: new RegExp('^' + email.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i') } });

    if (!user) {
        res.status(401);
        throw new Error('Invalid credentials');
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
        const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 60000);
        res.status(401);
        throw new Error(`Account locked. Try again in ${remainingTime} minutes.`);
    }

    if (user.password && (await bcrypt.compare(password, user.password))) {
        // Successful login - reset attempts
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await OTP.findOneAndUpdate(
            { email: user.email },
            { otp, createdAt: Date.now() },
            { upsert: true, new: true }
        );

        const htmlContent = `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #FF64B4; text-align: center;">Glitz Creativez Login Verification</h2>
                <p>Hello ${user.name},</p>
                <p>Use the following code to complete your login. This code will expire in 5 minutes.</p>
                <div style="background: #fdf6b2; padding: 15px; text-align: center; border-radius: 8px;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4cc9f0;">${otp}</span>
                </div>
                <p style="margin-top: 20px; color: #666; font-size: 14px;">If you didn't request this code, please secure your account.</p>
            </div>
        `;

        const emailSent = await sendBrevoEmail(user.email, user.name, 'Your Login Verification Code - Glitz Creativez', htmlContent);
        
        // Always log OTP to server logs for diagnostics/staging checks
        console.log(`[OTP DEBUG] Generated login OTP for ${user.email}: ${otp}`);

        if (!emailSent) {
            console.log(`[OTP] Sent code ${otp} to ${user.email} (Fallback console)`);
        }

        res.json({
            success: true,
            requiresOtp: true,
            email: user.email,
            message: 'OTP sent to your email'
        });
    } else {
        // Failed login - increment attempts
        user.loginAttempts = (user.loginAttempts || 0) + 1;

        if (user.loginAttempts >= 5) {
            user.lockUntil = Date.now() + 60 * 60 * 1000; // Lock for 1 hour
            await user.save();
            res.status(401);
            throw new Error('Too many failed attempts. Account locked for 1 hour.');
        }

        await user.save();
        res.status(401);
        throw new Error('Invalid credentials');
    }
});

// @desc    Verify OTP for Login
// @route   POST /api/auth/verify-login-otp
// @access  Public
export const verifyLoginOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        res.status(400);
        throw new Error('Please provide email and OTP');
    }

    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
        res.status(400);
        throw new Error('Invalid or expired OTP');
    }

    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Delete used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    res.json({
        success: true,
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
        },
    });
});

// @desc    Resend OTP for Login
// @route   POST /api/auth/resend-login-otp
// @access  Public
export const resendLoginOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(400);
        throw new Error('Please provide an email');
    }

    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Check for cooldown (60 seconds)
    const existingOTP = await OTP.findOne({ email });
    if (existingOTP && (Date.now() - existingOTP.createdAt) < 60000) {
        const waitTime = Math.ceil((60000 - (Date.now() - existingOTP.createdAt)) / 1000);
        res.status(429);
        throw new Error(`Please wait ${waitTime} seconds before requesting a new OTP`);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

    await OTP.findOneAndUpdate(
        { email },
        { otp, createdAt: Date.now() },
        { upsert: true, new: true }
    );

    const htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #FF64B4; text-align: center;">Glitz Creativez Login Verification</h2>
            <p>Hello ${user.name},</p>
            <p>Use the following code to complete your login. This code will expire in 5 minutes.</p>
            <div style="background: #fdf6b2; padding: 15px; text-align: center; border-radius: 8px;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4cc9f0;">${otp}</span>
            </div>
            <p style="margin-top: 20px; color: #666; font-size: 14px;">If you didn't request this code, please secure your account.</p>
        </div>
    `;

    const emailSent = await sendBrevoEmail(email, user.name, 'Your New Login Verification Code - Glitz Creativez', htmlContent);

    // Always log OTP to server logs for diagnostics/staging checks
    console.log(`[OTP DEBUG] Resent login OTP for ${email}: ${otp}`);

    if (!emailSent) {
        console.log(`[OTP] Sent new code ${otp} to ${email} (Fallback console)`);
    }

    res.json({ success: true, message: 'OTP resent successfully' });
});

// @desc    Send OTP to email
// @route   POST /api/auth/send-otp
// @access  Public
export const sendOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(400);
        throw new Error('Please provide an email');
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Check for cooldown (60 seconds)
    const existingOTP = await OTP.findOne({ email });
    if (existingOTP && (Date.now() - existingOTP.createdAt) < 60000) {
        const waitTime = Math.ceil((60000 - (Date.now() - existingOTP.createdAt)) / 1000);
        res.status(429);
        throw new Error(`Please wait ${waitTime} seconds before requesting a new OTP`);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

    // Save/Update OTP in DB
    await OTP.findOneAndUpdate(
        { email },
        { otp, createdAt: Date.now() },
        { upsert: true, new: true }
    );

    const htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #FF64B4; text-align: center;">Glitz Creativez Verification</h2>
            <p>Hello,</p>
            <p>Use the following code to verify your account registration. This code will expire in 5 minutes.</p>
            <div style="background: #fdf6b2; padding: 15px; text-align: center; border-radius: 8px;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4cc9f0;">${otp}</span>
            </div>
            <p style="margin-top: 20px; color: #666; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="text-align: center; color: #999; font-size: 12px;">&copy; 2026 Glitz Creativez. All rights reserved.</p>
        </div>
    `;

    const emailSent = await sendBrevoEmail(email, 'User', 'Verify Your Account - Glitz Creativez', htmlContent);

    // Always log OTP to server logs for diagnostics/staging checks
    console.log(`[OTP DEBUG] Generated registration OTP for ${email}: ${otp}`);

    if (!emailSent) {
        console.log(`[OTP] Sent code ${otp} to ${email} (Fallback console)`);
    }

    res.json({ success: true, message: 'OTP sent successfully' });
});

// @desc    Register user with OTP
// @route   POST /api/auth/register-otp
// @access  Public
export const registerWithOTP = asyncHandler(async (req, res) => {
    const { email, password, otp } = req.body;

    if (!email || !password || !otp) {
        res.status(400);
        throw new Error('Please provide all fields');
    }

    // Password complexity check
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
        res.status(400);
        throw new Error('Password must be at least 8 characters long and contain both letters and numbers');
    }

    // Verify OTP
    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
        res.status(400);
        throw new Error('Invalid or expired OTP');
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
        name: email.split('@')[0], // Default name from email
        email,
        password: hashedPassword,
        googleId: `email_auth_${Date.now()}`
    });

    if (user) {
        // Delete OTP record
        await OTP.deleteOne({ _id: otpRecord._id });

        res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                token: generateToken(user._id),
            },
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});
