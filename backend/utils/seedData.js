import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

// Resolve DNS SRV lookup issues for MongoDB Atlas clusters on Windows/local environment
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

const categories = [
    {
        name: 'Personalized Gifts',
        slug: 'personalized-gifts',
        description: 'Unique gifts customized just for them',
        image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=500',
        icon: '🎁',
        sequence: 1
    },
    {
        name: 'Flowers & Plants',
        slug: 'flowers-plants',
        description: 'Fresh bouquets and beautiful indoor plants',
        image: 'https://images.unsplash.com/photo-1490750967868-bcdf92dd2184?w=500',
        icon: '💐',
        sequence: 2
    },
    {
        name: 'Chocolates & Sweets',
        slug: 'chocolates-sweets',
        description: 'Gourmet chocolates and sweet treats',
        image: 'https://images.unsplash.com/photo-1481391319762-47dcd72909e1?w=500',
        icon: '🍫',
        sequence: 3
    },
    {
        name: 'Jewelry',
        slug: 'jewelry',
        description: 'Elegant necklaces, rings, and bracelets',
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500',
        icon: '💍',
        sequence: 4
    },
    {
        name: 'Home Decor',
        slug: 'home-decor',
        description: 'Stylish accents for every home',
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500',
        icon: '🏠',
        sequence: 5
    },
    {
        name: 'Gift Baskets',
        slug: 'gift-baskets',
        description: 'Curated sets for every occasion',
        image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500',
        icon: '🧺',
        sequence: 6
    }
];

const products = [
    // Personalized Gifts
    {
        name: 'Custom Engraved Wooden Watch',
        categoryName: 'Personalized Gifts',
        description: 'A timeless gift. Handcrafted sandalwood watch with a custom message engraved on the back. Perfect for anniversaries or birthdays.',
        price: 89.99,
        originalPrice: 119.99,
        images: [
            'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=500',
            'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500'
        ],
        brand: 'TimelessWood',
        stock: 50,
        rating: 4.8,
        numReviews: 45,
        featured: true,
        soldCount: 15,
        tags: ['personalized', 'watch', 'wood', 'engraved'],
        specifications: [
            { key: 'Material', value: 'Sandalwood' },
            { key: 'Movement', value: 'Japanese Quartz' },
            { key: 'Case Diameter', value: '45mm' }
        ]
    },
    {
        name: 'Personalized Name Necklace',
        categoryName: 'Personalized Gifts',
        description: 'Elegant 18k gold plated name necklace. Customize with any name or word up to 10 characters.',
        price: 49.99,
        originalPrice: 79.99,
        images: [
            'https://images.unsplash.com/photo-1602751584552-8ba43d4c3104?w=500'
        ],
        brand: 'GoldenTouch',
        stock: 100,
        rating: 4.9,
        numReviews: 120,
        featured: true,
        soldCount: 42,
        tags: ['jewelry', 'personalized', 'gift', 'necklace'],
        specifications: [
            { key: 'Material', value: '18k Gold Plated' },
            { key: 'Chain Length', value: '18 inches' }
        ]
    },
    {
        name: 'Custom Photo Canvas Print',
        categoryName: 'Personalized Gifts',
        description: 'Turn your favorite memory into a work of art. High-quality canvas print wrapped on a wooden frame.',
        price: 39.99,
        originalPrice: 59.99,
        images: [
            'https://images.unsplash.com/photo-1579783902614-a3fb39279c23?w=500'
        ],
        brand: 'MemoryLane',
        stock: 200,
        rating: 4.7,
        numReviews: 85,
        featured: false,
        soldCount: 22,
        tags: ['decor', 'personalized', 'photo', 'memory']
    },

    // Flowers & Plants
    {
        name: 'Classic Red Rose Bouquet',
        categoryName: 'Flowers & Plants',
        description: 'A romantic arrangement of 12 premium long-stemmed red roses. Delivered fresh to their door.',
        price: 59.99,
        originalPrice: 79.99,
        images: [
            'https://images.unsplash.com/photo-1562690868-60bbe7293e94?w=500',
            'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500'
        ],
        brand: 'BloomBox',
        stock: 30,
        rating: 4.8,
        numReviews: 210,
        featured: true,
        soldCount: 85,
        tags: ['flowers', 'roses', 'romantic', 'love'],
        specifications: [
            { key: 'Flower Type', value: 'Red Roses' },
            { key: 'Stem Count', value: '12' }
        ]
    },
    {
        name: 'Peace Lily Plant',
        categoryName: 'Flowers & Plants',
        description: 'A beautiful indoor plant known for its air-purifying qualities and elegant white blooms. Easy to care for.',
        price: 34.99,
        originalPrice: 49.99,
        images: [
            'https://images.unsplash.com/photo-1593696954577-68094896d833?w=500'
        ],
        brand: 'GreenLife',
        stock: 45,
        rating: 4.6,
        numReviews: 67,
        featured: false,
        soldCount: 30,
        tags: ['plant', 'indoor', 'air-purifying']
    },
    {
        name: 'Spring Tulip Mix',
        categoryName: 'Flowers & Plants',
        description: 'Vibrant mix of colorful tulips to brighten anyone\'s day. Perfect for birthdays or "get well soon".',
        price: 44.99,
        originalPrice: 54.99,
        images: [
            'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=500'
        ],
        brand: 'BloomBox',
        stock: 40,
        rating: 4.7,
        numReviews: 55,
        featured: false,
        tags: ['flowers', 'tulips', 'spring', 'colorful']
    },

    // Chocolates & Sweets
    {
        name: 'Luxury Belgian Truffles',
        categoryName: 'Chocolates & Sweets',
        description: 'A decadent collection of 24 handcrafted Belgian chocolate truffles. Flavors include dark chocolate, hazelnut, and raspberry.',
        price: 39.99,
        originalPrice: 49.99,
        images: [
            'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=500',
            'https://images.unsplash.com/photo-1526081347589-7fa3cbcd1f9c?w=500'
        ],
        brand: 'ChocoLuxe',
        stock: 200,
        rating: 4.9,
        numReviews: 340,
        featured: true,
        soldCount: 120,
        tags: ['chocolate', 'sweets', 'gourmet', 'gift'],
        specifications: [
            { key: 'Weight', value: '500g' },
            { key: 'Pieces', value: '24' }
        ]
    },
    {
        name: 'Assorted French Macarons',
        categoryName: 'Chocolates & Sweets',
        description: 'Delicate and colorful French macarons in a variety of flavors including vanilla, pistachio, and strawberry.',
        price: 29.99,
        originalPrice: 39.99,
        images: [
            'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=500'
        ],
        brand: 'PetitSweet',
        stock: 150,
        rating: 4.7,
        numReviews: 125,
        featured: true,
        tags: ['macarons', 'sweets', 'french', 'gift']
    },

    // Jewelry
    {
        name: 'Silver Heart Pendant',
        categoryName: 'Jewelry',
        description: 'Sterling silver heart pendant necklace with a cubic zirconia accent. A classic symbol of love.',
        price: 69.99,
        originalPrice: 89.99,
        images: [
            'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500'
        ],
        brand: 'SilverLine',
        stock: 60,
        rating: 4.8,
        numReviews: 78,
        featured: true,
        soldCount: 55,
        tags: ['jewelry', 'necklace', 'silver', 'heart']
    },
    {
        name: 'Classic Pearl Earrings',
        categoryName: 'Jewelry',
        description: 'Genuine freshwater pearl stud earrings. Simple, elegant, and perfect for any occasion.',
        price: 49.99,
        originalPrice: 69.99,
        images: [
            'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500'
        ],
        brand: 'OceanGem',
        stock: 80,
        rating: 4.9,
        numReviews: 95,
        featured: false,
        tags: ['jewelry', 'earrings', 'pearl', 'classic']
    },

    // Home Decor
    {
        name: 'Scented Soy Candle Set',
        categoryName: 'Home Decor',
        description: 'Set of 3 hand-poured soy candles with calming scents like Lavender, Vanilla, and Sandalwood.',
        price: 34.99,
        originalPrice: 49.99,
        images: [
            'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=500'
        ],
        brand: 'SerenityScents',
        stock: 120,
        rating: 4.7,
        numReviews: 156,
        featured: true,
        soldCount: 92,
        tags: ['decor', 'candles', 'home', 'scent']
    },
    {
        name: 'Ceramic Vase (Modern)',
        categoryName: 'Home Decor',
        description: 'Minimalist white ceramic vase with a textured finish. Adds a modern touch to any room.',
        price: 24.99,
        originalPrice: 34.99,
        images: [
            'https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=500'
        ],
        brand: 'UrbanHome',
        stock: 75,
        rating: 4.5,
        numReviews: 42,
        featured: false,
        tags: ['decor', 'vase', 'modern', 'ceramic']
    },

    // Gift Baskets
    {
        name: 'Ultimate Spa Day Basket',
        categoryName: 'Gift Baskets',
        description: 'Pamper them with this luxurious spa basket containing bath bombs, body lotion, a plush robe, and scented candles.',
        price: 89.99,
        originalPrice: 129.99,
        images: [
            'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=500'
        ],
        brand: 'RelaxationCo',
        stock: 40,
        rating: 4.9,
        numReviews: 88,
        featured: true,
        soldCount: 64,
        tags: ['gift basket', 'spa', 'relaxation', 'luxury'],
        specifications: [
            { key: 'Items', value: '7' },
            { key: 'Theme', value: 'Relaxation' }
        ]
    },
    {
        name: 'Gourmet Coffee Sampler',
        categoryName: 'Gift Baskets',
        description: 'A selection of premium coffee beans from around the world, paired with artisan biscotti and a ceramic mug.',
        price: 54.99,
        originalPrice: 69.99,
        images: [
            'https://images.unsplash.com/photo-1523368249101-bf1f162cee89?w=500'
        ],
        brand: 'BrewMasters',
        stock: 60,
        rating: 4.8,
        numReviews: 112,
        featured: false,
        tags: ['gift basket', 'coffee', 'gourmet']
    },
    // NEW PRODUCTS (20 Added)
    {
        name: 'Monogrammed Leather Wallet',
        categoryName: 'Personalized Gifts',
        description: 'Genuine leather wallet professionally embossed with your initials.',
        price: 55.00,
        originalPrice: 75.00,
        images: ['https://images.unsplash.com/photo-1627123424574-18bd0833158c?w=500'],
        brand: 'LeatherCraft',
        stock: 50,
        rating: 4.7,
        numReviews: 32,
        featured: true,
        tags: ['leather', 'wallet', 'personalized'],
        specifications: [{ key: 'Material', value: 'Genuine Leather' }]
    },
    {
        name: 'Custom Star Map Print',
        categoryName: 'Personalized Gifts',
        description: 'A beautiful map of the stars from a specific date and location. Perfect for anniversaries.',
        price: 45.00,
        originalPrice: 60.00,
        images: ['https://images.unsplash.com/photo-1534234828569-1f9eb702220d?w=500'], // Generic night sky
        brand: 'StarryNight',
        stock: 100,
        rating: 4.9,
        numReviews: 210,
        featured: true,
        tags: ['decor', 'personalized', 'romantic']
    },
    {
        name: 'Engraved Cutting Board',
        categoryName: 'Personalized Gifts',
        description: 'Bamboo cutting board customized with a family name or special date.',
        price: 35.00,
        images: ['https://images.unsplash.com/photo-1594385208974-2e75f8d7bb48?w=500'],
        brand: 'ChefCustom',
        stock: 60,
        rating: 4.6,
        numReviews: 45,
        featured: false,
        tags: ['kitchen', 'personalized', 'cooking']
    },
    {
        name: 'Personalized Pet Portrait',
        categoryName: 'Personalized Gifts',
        description: 'Turn a photo of a beloved pet into a digital art masterpiece on canvas.',
        price: 60.00,
        originalPrice: 80.00,
        images: ['https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=500'],
        brand: 'PawPrints',
        stock: 100,
        rating: 5.0,
        numReviews: 88,
        featured: true,
        tags: ['pet', 'personalized', 'art']
    },
    {
        name: 'Orchid Pot Arrangement',
        categoryName: 'Flowers & Plants',
        description: 'Elegant white orchid in a ceramic pot. Long-lasting and sophisticated.',
        price: 45.00,
        originalPrice: 55.00,
        images: ['https://images.unsplash.com/photo-1566952726665-27a37c569f21?w=500'],
        brand: 'GreenLife',
        stock: 30,
        rating: 4.7,
        numReviews: 54,
        featured: false,
        tags: ['flowers', 'orchid', 'indoor']
    },
    {
        name: 'Succulent Garden Trio',
        categoryName: 'Flowers & Plants',
        description: 'Three low-maintenance succulents in geometric concrete planters.',
        price: 28.00,
        images: ['https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=500'],
        brand: 'UrbanGrown',
        stock: 50,
        rating: 4.5,
        numReviews: 92,
        featured: true,
        tags: ['plant', 'succulent', 'modern']
    },
    {
        name: 'Dried Flower Bouquet - Boho',
        categoryName: 'Flowers & Plants',
        description: 'Trendy dried flower arrangement that lasts forever. Perfect rustic decor.',
        price: 38.00,
        images: ['https://images.unsplash.com/photo-1563241527-300c27949398?w=500'],
        brand: 'Everlast',
        stock: 40,
        rating: 4.8,
        numReviews: 67,
        featured: false,
        tags: ['flowers', 'dried', 'boho']
    },
    {
        name: 'Artisan Bonbon Box',
        categoryName: 'Chocolates & Sweets',
        description: ' Colorful hand-painted chocolate bonbons with exotic fillings like yuzu and passionfruit.',
        price: 42.00,
        originalPrice: 52.00,
        images: ['https://images.unsplash.com/photo-1548907040-4baa42d10919?w=500'],
        brand: 'ChocoArt',
        stock: 80,
        rating: 4.9,
        numReviews: 105,
        featured: true,
        tags: ['chocolate', 'gourmet', 'artisan']
    },
    {
        name: 'Gummy Bear Tower',
        categoryName: 'Chocolates & Sweets',
        description: 'A fun tower of gourmet gummy bears in various fruit flavors.',
        price: 25.00,
        images: ['https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=500'],
        brand: 'SweetTooth',
        stock: 150,
        rating: 4.4,
        numReviews: 200,
        featured: false,
        tags: ['candy', 'sweets', 'fun']
    },
    {
        name: 'Dark Chocolate Sea Salt Caramels',
        categoryName: 'Chocolates & Sweets',
        description: 'Rich dark chocolate covering smooth caramel with a touch of sea salt.',
        price: 18.00,
        images: ['https://images.unsplash.com/photo-1616031032824-33b668f844ba?w=500'],
        brand: 'ChocoLuxe',
        stock: 200,
        rating: 4.8,
        numReviews: 312,
        featured: true,
        tags: ['chocolate', 'caramel', 'salty']
    },
    {
        name: 'Rose Gold Bar Bracelet',
        categoryName: 'Jewelry',
        description: 'Minimalist rose gold bar bracelet, adjustable size.',
        price: 35.00,
        originalPrice: 50.00,
        images: ['https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=500'],
        brand: 'RoseJewels',
        stock: 75,
        rating: 4.6,
        numReviews: 45,
        featured: false,
        tags: ['jewelry', 'bracelet', 'rosegold']
    },
    {
        name: 'Crystal Stud Earrings Set',
        categoryName: 'Jewelry',
        description: 'Set of 3 pairs of sparkling crystal studs in different sizes.',
        price: 28.00,
        images: ['https://images.unsplash.com/photo-1596944924616-b69904944443?w=500'], // generic jewelry
        brand: 'SparkleCo',
        stock: 100,
        rating: 4.5,
        numReviews: 89,
        featured: false,
        tags: ['jewelry', 'earrings', 'set']
    },
    {
        name: 'Infinity Knot Ring',
        categoryName: 'Jewelry',
        description: 'Symbol of eternal love. Sterling silver knot ring.',
        price: 22.00,
        images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500'],
        brand: 'SilverLine',
        stock: 60,
        rating: 4.7,
        numReviews: 120,
        featured: true,
        tags: ['jewelry', 'ring', 'silver']
    },
    {
        name: 'Geometric Throw Pillow',
        categoryName: 'Home Decor',
        description: 'Velvet throw pillow with a modern geometric pattern in gold and navy.',
        price: 32.00,
        images: ['https://images.unsplash.com/photo-1579656381226-5fc70366eb6b?w=500'],
        brand: 'LuxeHome',
        stock: 40,
        rating: 4.6,
        numReviews: 35,
        featured: false,
        tags: ['decor', 'pillow', 'velvet']
    },
    {
        name: 'Himalayan Salt Lamp',
        categoryName: 'Home Decor',
        description: 'Natural hand-carved salt lamp that creates a warm, relaxing glow.',
        price: 25.00,
        originalPrice: 35.00,
        images: ['https://images.unsplash.com/photo-1517865288-978fcb780652?w=500'],
        brand: 'ZenLiving',
        stock: 80,
        rating: 4.8,
        numReviews: 450,
        featured: true,
        tags: ['decor', 'lamp', 'wellness']
    },
    {
        name: 'Ceramic Table Planter',
        categoryName: 'Home Decor',
        description: 'Small ceramic planter with wooden stand, perfect for desks.',
        price: 22.00,
        images: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500'],
        brand: 'UrbanGrow',
        stock: 60,
        rating: 4.5,
        numReviews: 28,
        featured: false,
        tags: ['decor', 'planter', 'minamlist']
    },
    {
        name: 'Abstract Wall Art Print',
        categoryName: 'Home Decor',
        description: 'Modern abstract art print, framed and ready to hang.',
        price: 55.00,
        images: ['https://images.unsplash.com/photo-1580327344181-c1163234e5a0?w=500'],
        brand: 'Artify',
        stock: 30,
        rating: 4.7,
        numReviews: 12,
        featured: false,
        tags: ['decor', 'art', 'wall']
    },
    {
        name: 'Wine & Cheese Hamper',
        categoryName: 'Gift Baskets',
        description: 'Premium red wine, artisanal cheese selection, crackers, and chutney.',
        price: 75.00,
        originalPrice: 90.00,
        images: ['https://images.unsplash.com/photo-1565553531535-71be992c556b?w=500'], // Generic food
        brand: 'GourmetGifts',
        stock: 25,
        rating: 4.9,
        numReviews: 65,
        featured: true,
        tags: ['gift basket', 'food', 'wine']
    },
    {
        name: 'Tea Lover\'s Collection',
        categoryName: 'Gift Baskets',
        description: 'Assortment of organic herbal teas, honey sticks, and a glass teapot.',
        price: 45.00,
        images: ['https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500'],
        brand: 'ZenTea',
        stock: 50,
        rating: 4.8,
        numReviews: 98,
        featured: false,
        tags: ['gift basket', 'tea', 'organic']
    },
    {
        name: 'Movie Night Box',
        categoryName: 'Gift Baskets',
        description: 'Everything for a perfect movie night: Popcorn, seasonings, candy, and soda.',
        price: 30.00,
        images: ['https://images.unsplash.com/photo-1585647347384-2593bc35786b?w=500'],
        brand: 'FunBox',
        stock: 100,
        rating: 4.6,
        numReviews: 145,
        featured: true,
        tags: ['gift basket', 'movie', 'fun']
    }
];

const seedDatabase = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce';

        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB connected');

        // Clear existing data
        await User.deleteMany();
        await Category.deleteMany();
        await Product.deleteMany();
        console.log('🗑️  Existing data cleared');

        // Create admin user
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@gmail.com',
            phone: '1111111111',
            countryCode: '+91',
            password: 'glitz@4716',
            isAdmin: true
        });
        console.log('👤 Admin user created (Email: admin@gmail.com / Pass: glitz@4716)');

        // Create test user
        await User.create({
            name: 'Test User',
            email: 'test@example.com',
            phone: '9876543210',
            countryCode: '+91',
            password: 'test123'
        });
        console.log('👤 Test user created (Phone: 9876543210 / Pass: test123)');

        // Create categories
        const createdCategories = await Category.insertMany(categories);
        console.log(`📁 ${createdCategories.length} categories created`);

        // Map category names to IDs
        const categoryMap = {};
        createdCategories.forEach(cat => {
            categoryMap[cat.name] = cat._id;
        });

        // Add category references to products
        const productsWithCategory = products.map((product) => {
            if (!categoryMap[product.categoryName]) {
                throw new Error(`Category not found for product: ${product.name} (${product.categoryName})`);
            }
            return {
                ...product,
                category: categoryMap[product.categoryName]
            };
        });

        // Create products
        await Product.insertMany(productsWithCategory);
        console.log(`📦 ${productsWithCategory.length} products created`);

        console.log('\n✨ Database seeded successfully!');
        console.log('\n📋 Login Credentials:');
        console.log('   Admin: Email: admin@gmail.com / Pass: glitz@4716');
        console.log('   User:  Phone: 9876543210 / Pass: test123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
