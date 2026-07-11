import path from 'path';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import dns from 'dns';
dns.setServers(['1.1.1.1', '8.8.8.8']);
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();

// Trust proxy is required if deploying behind a reverse proxy like Railway/Render
// This ensures express-rate-limit uses the actual client IP instead of the load balancer's IP
app.set('trust proxy', 1);

// Middleware
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5176', 'http://localhost:5174', 'http://localhost:5175'];
if (process.env.FRONTEND_URL) {
    const cleanOrigin = process.env.FRONTEND_URL.replace(/\/$/, '');
    allowedOrigins.push(cleanOrigin);
    allowedOrigins.push(`${cleanOrigin}/`);
}

app.use(cors({
    origin: function (origin, callback) {
        // Allow localhost, configured FRONTEND_URL, or any Vercel preview domain
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error(`Not allowed by CORS: ${origin}`));
        }
    },
    credentials: true
}));

// Security Headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Prevent NoSQL injections
app.use(mongoSanitize());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 150, // Limit each IP to 150 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 20,
    message: 'Too many authentication requests, please try again later'
});
app.use('/api/auth', authLimiter);

import passport from 'passport';
import './utils/passportSetup.js';
app.use(passport.initialize());

// Request Logger
app.use((req, res, next) => {
    console.log(`[DEBUG] ${req.method} ${req.url}`);
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
console.log('[DEBUG] Registering Routes...');
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', (req, res, next) => {
    console.log('[DEBUG] Hit /api/categories');
    next();
}, categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);

const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Root route
app.get('/', (req, res) => {
    res.send('Ecommerce API is running...');
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Database connection and server start
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB connected successfully');
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('❌ MongoDB connection error:', error.message);
        if (error.message.includes('ENOTFOUND')) {
            console.error('👉 TIP: This is a DNS/Network error. Check your internet connection or if your network/ISP blocks MongoDB Atlas SRV records.');
            console.error('👉 Try using a local MongoDB URI like: MONGO_URI=mongodb://127.0.0.1:27017/ecommerce');
        }
        process.exit(1);
    });
// Force restart 2
