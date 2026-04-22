import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('❌ MONGO_URI is not defined in .env file');
    process.exit(1);
}

console.log('Attempting to connect to MongoDB...');
console.log('URI:', MONGO_URI.replace(/:([^@]+)@/, ':****@')); // Hide password

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB connected successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ MongoDB connection error:');
        console.error(error.message);
        if (error.message.includes('IP address') || error.message.includes('whitelist')) {
            console.log('\nSuggestion: Your IP address might not be whitelisted on MongoDB Atlas.');
            console.log('Go to: https://www.mongodb.com/docs/atlas/security-whitelist/');
        }
        process.exit(1);
    });
