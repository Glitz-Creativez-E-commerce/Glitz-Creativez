import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
    const { shippingAddress, paymentMethod } = req.body;

    // Get user cart
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
        res.status(400);
        throw new Error('No items in cart');
    }

    // Calculate prices
    const itemsPrice = cart.items.reduce(
        (acc, item) => acc + item.product.price * item.quantity,
        0
    );

    const taxPrice = Number((itemsPrice * 0.1).toFixed(2)); // 10% tax
    const shippingPrice = itemsPrice > 100 ? 0 : 10; // Free shipping over $100
    const totalPrice = Number((itemsPrice + taxPrice + shippingPrice).toFixed(2));

    // Create order items
    const orderItems = cart.items.map((item) => ({
        product: item.product._id,
        name: item.product.name,
        image: item.product.images[0] || '',
        price: item.product.price,
        quantity: item.quantity,
    }));

    // Update stock and soldCount
    for (const item of cart.items) {
        const product = await Product.findById(item.product._id);
        product.stock -= item.quantity;
        product.soldCount = (product.soldCount || 0) + item.quantity;
        await product.save();
    }

    // Create order
    const order = await Order.create({
        user: req.user._id,
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        isPaid: paymentMethod === 'cod' ? false : true, // Simulate payment for non-COD
        paidAt: paymentMethod === 'cod' ? null : Date.now(),
    });

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
        success: true,
        data: order,
    });
});

// @desc    Get logged in user orders
// @route   GET /api/orders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.json({
        success: true,
        data: orders,
    });
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
        // Check if order belongs to user or user is admin
        if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            res.status(403);
            throw new Error('Not authorized');
        }

        res.json({
            success: true,
            data: order,
        });
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            updateTime: req.body.update_time,
            emailAddress: req.body.payer?.email_address,
        };

        const updatedOrder = await order.save();

        res.json({
            success: true,
            data: updatedOrder,
        });
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.status = req.body.status || order.status;

        if (req.body.status === 'delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }

        if (req.body.trackingNumber) {
            order.trackingNumber = req.body.trackingNumber;
        }

        const updatedOrder = await order.save();

        res.json({
            success: true,
            data: updatedOrder,
        });
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    // Check if order belongs to user
    if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        res.status(403);
        throw new Error('Not authorized');
    }

    if (order.status !== 'pending') {
        res.status(400);
        throw new Error('Order cannot be cancelled');
    }

    // Restore stock
    for (const item of order.orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
            product.stock += item.quantity;
            await product.save();
        }
    }

    order.status = 'cancelled';
    await order.save();

    res.json({
        success: true,
        message: 'Order cancelled',
    });
});

// @desc    Get all orders
// @route   GET /api/orders/admin/all
// @access  Private/Admin
export const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({}).populate('user', 'id name email avatar').sort({ createdAt: -1 });
    res.json({
        success: true,
        data: orders,
    });
});
