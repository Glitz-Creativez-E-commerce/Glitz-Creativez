import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

// Force Node.js to use Google's DNS servers instead of the default ISP ones
// This often fixes the ECONNREFUSED querySrv error.
dns.setServers(['8.8.8.8', '8.8.4.4']);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const migrateImages = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce';
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB connected');

        // 1. Migrate Category Images
        const categories = await Category.find({});
        console.log(`Found ${categories.length} categories to process...`);
        for (const category of categories) {
            if (category.image && category.image.includes('unsplash.com')) {
                console.log(`Migrating image for category: ${category.name}`);
                try {
                    const result = await cloudinary.uploader.upload(category.image, {
                        folder: 'glitz-creativez/categories',
                    });
                    category.image = result.secure_url;
                    await category.save();
                    console.log(`✅ Success: ${category.name}`);
                } catch (err) {
                    console.error(`❌ Failed to upload image for ${category.name}`, err);
                }
            }
        }

        // 2. Migrate Product Images
        const products = await Product.find({});
        console.log(`\nFound ${products.length} products to process...`);
        for (const product of products) {
            let imagesUpdated = false;
            const newImages = [];
            
            for (const imgUrl of product.images) {
                if (imgUrl.includes('unsplash.com')) {
                    console.log(`Migrating image for product: ${product.name}`);
                    try {
                        const result = await cloudinary.uploader.upload(imgUrl, {
                            folder: 'glitz-creativez/products',
                        });
                        newImages.push(result.secure_url);
                        imagesUpdated = true;
                        console.log(`  ✅ Uploaded to: ${result.secure_url}`);
                    } catch (err) {
                        console.error(`  ❌ Failed to upload image for ${product.name}`, err);
                        newImages.push(imgUrl); // keep old if failed
                    }
                } else {
                    newImages.push(imgUrl);
                }
            }

            if (imagesUpdated) {
                product.images = newImages;
                await product.save();
                console.log(`✅ Product updated: ${product.name}`);
            }
        }

        console.log('\n🎉 Migration Complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

migrateImages();
