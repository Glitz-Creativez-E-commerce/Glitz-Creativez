import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// Resolve DNS SRV lookup issues for MongoDB Atlas clusters on Windows/local environment
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

const clearDatabase = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce';

        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB connected');

        // Clear products, categories, and orders
        await Product.deleteMany();
        await Category.deleteMany();
        await Order.deleteMany();
        console.log('🗑️ All products, categories, and orders cleared.');

        // Delete all users
        await User.deleteMany();
        console.log('🗑️ All users deleted.');

        // Verify or create a default Admin user if none exists
        const adminExists = await User.findOne({ isAdmin: true });
        if (!adminExists) {
            await User.create({
                name: 'Admin User',
                email: 'admin@gmail.com',
                phone: '1111111111',
                countryCode: '+91',
                password: 'glitz@4716',
                isAdmin: true
            });
            console.log('👤 Created default Admin User (Phone: 1111111111 / Pass: glitz@4716)');
        } else {
            console.log(`👤 Admin user retained: ${adminExists.phone}`);
        }

        console.log('\n✨ Database is now clean and ready for real products!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error clearing database:', error);
        process.exit(1);
    }
};

clearDatabase();
