import asyncHandler from 'express-async-handler';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';
import dotenv from 'dotenv';
dotenv.config();

let razorpay;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
} else {
    console.warn('⚠️ Razorpay Key ID or Secret is missing in .env file. Payment functionality will be disabled.');
}

// @desc    Create Razorpay Order
// @route   POST /api/orders/:id/razorpay
// @access  Private
export const createRazorpayOrder = asyncHandler(async (req, res) => {
    if (!razorpay) {
        res.status(500);
        throw new Error('Razorpay is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env file.');
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    if (order.isPaid) {
        res.status(400);
        throw new Error('Order is already paid');
    }

    // Amount should be strictly calculated based on database order.totalPrice in paise (currency subunit)
    const amount = Math.round(order.totalPrice * 100);

    const options = {
        amount: amount,
        currency: 'INR',
        receipt: `receipt_order_${order._id}`,
    };

    try {
        const razorpayOrder = await razorpay.orders.create(options);
        res.json(razorpayOrder);
    } catch (error) {
        res.status(500);
        throw new Error('Razorpay order creation failed: ' + error.message);
    }
});

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/orders/:id/verify-payment
// @access  Private
export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // We enforce secret strictly via env var
    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
        res.status(500);
        throw new Error('Razorpay secret not configured');
    }

    // Creating HMAC SHA256 Hash
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    // Comapring our digest with the actual signature
    if (digest !== razorpay_signature) {
        res.status(400);
        throw new Error('Payment verification failed');
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    // Success - update DB
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
        id: razorpay_payment_id,
        status: 'success',
        updateTime: new Date().toISOString(),
        emailAddress: req.user.email,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    };

    const updatedOrder = await order.save();

    res.json({
        success: true,
        message: 'Payment verified successfully',
        order: updatedOrder
    });
});
