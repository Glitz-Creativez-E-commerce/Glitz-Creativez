import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('📦 Connected to MongoDB');

        const db = mongoose.connection.db;

        // Clear existing data
        await db.collection('users').deleteMany({});
        await db.collection('categories').deleteMany({});
        await db.collection('products').deleteMany({});
        await db.collection('orders').deleteMany({});
        console.log('🗑️ Cleared existing data');

        // Create Admin User
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        await db.collection('users').insertOne({
            name: 'Admin',
            phone: '1111111111',
            countryCode: '+91',
            password: hashedPassword,
            isAdmin: true,
            wishlist: [],
            address: { street: '', city: '', state: '', zipCode: '', country: '' },
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        console.log('✅ Admin user created: Phone: 1111111111 / Pass: admin123');

        // Create Categories
        const categoryDocs = [
            {
                name: 'Birthday Gifts',
                slug: 'birthday-gifts',
                image: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=500',
                icon: '🎂',
                sequence: 1,
                description: 'Perfect gifts for birthday celebrations',
                isActive: true
            },
            {
                name: 'Wedding Gifts',
                slug: 'wedding-gifts',
                image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=500',
                icon: '💍',
                sequence: 2,
                description: 'Elegant gifts for weddings',
                isActive: true
            },
            {
                name: 'Anniversary',
                slug: 'anniversary',
                image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=500',
                icon: '❤️',
                sequence: 3,
                description: 'Romantic anniversary gifts',
                isActive: true
            },
            {
                name: 'Corporate Gifts',
                slug: 'corporate-gifts',
                image: 'https://images.unsplash.com/photo-1513885535751-8b9238cd48bcc?w=500', // Replaced with a more generic gift/office image
                icon: '🏢',
                sequence: 4,
                description: 'Professional gifts for business',
                isActive: true
            },
            {
                name: 'Baby Shower',
                slug: 'baby-shower',
                image: 'https://images.unsplash.com/photo-1522771753062-5a398f6a7366?w=500',
                icon: '👶',
                sequence: 5,
                description: 'Adorable gifts for new arrivals',
                isActive: true
            },
            {
                name: 'Thank You',
                slug: 'thank-you',
                image: 'https://images.unsplash.com/photo-1505934333218-8fe21ce87363?w=500',
                icon: '🙏',
                sequence: 6,
                description: 'Show your appreciation',
                isActive: true
            },
        ].map(c => ({ ...c, createdAt: new Date(), updatedAt: new Date() }));

        const categoriesResult = await db.collection('categories').insertMany(categoryDocs);
        const categoryIds = Object.values(categoriesResult.insertedIds);
        console.log('✅ Categories created');

        // Create Sample Products
        const productDocs = [
            {
                name: 'Luxury Gift Box Set',
                description: 'A premium collection of curated items perfect for any special occasion.',
                price: 79.99,
                originalPrice: 99.99,
                category: categoryIds[0],
                images: ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500'],
                stock: 50,
                featured: true,
                rating: 4.8,
                numReviews: 124,
                isActive: true,
            },
            {
                name: 'Crystal Photo Frame',
                description: 'Beautiful crystal frame that preserves your precious memories.',
                price: 45.99,
                originalPrice: 59.99,
                category: categoryIds[1],
                images: ['https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=500'],
                stock: 35,
                featured: true,
                rating: 4.6,
                numReviews: 89,
                isActive: true,
            },
            {
                name: 'Personalized Jewelry Box',
                description: 'Elegant wooden jewelry box with custom engraving.',
                price: 65.00,
                originalPrice: 85.00,
                category: categoryIds[2],
                images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500'],
                stock: 25,
                featured: true,
                rating: 4.9,
                numReviews: 156,
                isActive: true,
            },
            {
                name: 'Executive Pen Set',
                description: 'Premium fountain pen set in a luxurious presentation box.',
                price: 89.99,
                category: categoryIds[3],
                images: ['https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500'],
                stock: 40,
                featured: false,
                rating: 4.5,
                numReviews: 67,
                isActive: true,
            },
            {
                name: 'Baby Essentials Gift Basket',
                description: 'Adorable gift basket with organic baby products and plush toys.',
                price: 55.00,
                originalPrice: 70.00,
                category: categoryIds[4],
                images: ['https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=500'],
                stock: 30,
                featured: true,
                rating: 4.7,
                numReviews: 98,
                isActive: true,
            },
            {
                name: 'Gourmet Chocolate Collection',
                description: 'Handcrafted artisan chocolates from around the world.',
                price: 39.99,
                category: categoryIds[5],
                images: ['https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500'],
                stock: 60,
                featured: true,
                rating: 4.9,
                numReviews: 203,
                isActive: true,
            },
            {
                name: 'Scented Candle Gift Set',
                description: 'Set of 6 premium scented candles with calming fragrances.',
                price: 35.00,
                originalPrice: 45.00,
                category: categoryIds[0],
                images: ['https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=500'],
                stock: 45,
                featured: false,
                rating: 4.4,
                numReviews: 76,
                isActive: true,
            },
            {
                name: 'Personalized Wine Set',
                description: 'Elegant wine set with personalized glasses and accessories.',
                price: 120.00,
                originalPrice: 150.00,
                category: categoryIds[2],
                images: ['https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500'],
                stock: 20,
                featured: true,
                rating: 4.8,
                numReviews: 112,
                isActive: true,
            },
        ].map(p => ({ ...p, createdAt: new Date(), updatedAt: new Date() }));

        await db.collection('products').insertMany(productDocs);
        console.log('✅ Sample products created');

        console.log('🎉 Database seeded successfully!');
        console.log('\n👤 Admin Login:');
        console.log('   Phone: +91 1111111111');
        console.log('   Password: admin123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error.message);
        process.exit(1);
    }
};

seedDatabase();
