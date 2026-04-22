import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Config
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const dropIndex = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        const collection = conn.connection.collection('users');

        try {
            const indexes = await collection.indexes();
            console.log('Current Indexes:', indexes);

            if (indexes.some(idx => idx.name === 'email_1')) {
                await collection.dropIndex('email_1');
                console.log('SUCCESS: Dropped index "email_1"');
            } else {
                console.log('Index "email_1" not found. It might have already been dropped.');
            }
        } catch (error) {
            console.error('Error checking/dropping index:', error);
        }

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

dropIndex();
