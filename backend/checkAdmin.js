import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const checkAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const email = 'admin@gmail.com';
        const password = 'admin123';

        let admin = await User.findOne({ email });

        if (admin) {
            console.log(`Admin user found: ${admin.email}`);
            console.log(`Current isAdmin: ${admin.isAdmin}`);

            // Force update password to trigger hashing hook if save is called, 
            // but we need to be careful if we just set it directly. 
            // User model pre-save hook usually hashes password if modified.
            admin.password = password;
            admin.isAdmin = true;
            await admin.save();
            console.log('Admin password updated to: admin123');
            console.log('Admin privileges ensured.');
        } else {
            console.log('Admin user not found. Creating...');
            admin = await User.create({
                name: 'Admin User',
                email: email,
                password: password,
                phone: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
                isAdmin: true
            });
            console.log('Admin user created successfully.');
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkAdmin();
