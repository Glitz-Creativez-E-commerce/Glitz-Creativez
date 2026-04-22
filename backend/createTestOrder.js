import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/Order.js';
import User from './models/User.js';
import Product from './models/Product.js';

dotenv.config();

const createTestOrder = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce';
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB connected');

        // Find a user or create one
        let user = await User.findOne({ phonr: '9876543210' }); // Try to find the seed test user
        if (!user) {
            user = await User.findOne({}); // Find any user
        }

        if (!user) {
            console.log("No user found, creating one...");
            user = await User.create({
                name: 'Jobin Test',
                email: 'jobin@test.com',
                phone: '9876543210',
                countryCode: '+91',
                password: 'password123',
                isAdmin: false
            });
        }

        console.log(`Using user: ${user.name} (${user._id})`);

        // Find a product
        const product = await Product.findOne({});
        if (!product) {
            console.error("No products found! Please run seed script first.");
            process.exit(1);
        }

        // Create Order
        const order = new Order({
            user: user._id,
            orderItems: [{
                product: product._id,
                name: product.name,
                image: product.images[0],
                price: product.price,
                quantity: 1
            }],
            shippingAddress: {
                fullName: 'Jobin Test',
                email: 'jobin@test.com', // keeping email in address for schema compliance
                phone: '9876543210',
                street: '123 Test St',
                city: 'Test City',
                state: 'TS',
                zipCode: '12345',
                country: 'India'
            },
            paymentMethod: 'cod',
            itemsPrice: product.price,
            taxPrice: 0,
            shippingPrice: 0,
            totalPrice: product.price,
            isPaid: false,
            isDelivered: false,
            status: 'pending' // using 'pending' to test the message logic
        });

        await order.save();
        console.log('✅ Test order created successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error creating test order:', error);
        process.exit(1);
    }
};

createTestOrder();
