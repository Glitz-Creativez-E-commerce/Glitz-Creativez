import asyncHandler from 'express-async-handler';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = asyncHandler(async (req, res) => {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
        path: 'items.product',
        select: 'name price images stock',
    });

    if (!cart) {
        cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Filter out items with null products (deleted products)
    cart.items = cart.items.filter((item) => item.product !== null);
    await cart.save();

    res.json({
        success: true,
        data: cart,
    });
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity = 1 } = req.body;

    // Validate product
    const product = await Product.findById(productId);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    if (product.stock < quantity) {
        res.status(400);
        throw new Error('Not enough stock');
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        cart = await Cart.create({
            user: req.user._id,
            items: [{ product: productId, quantity }],
        });
    } else {
        const itemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId
        );

        if (itemIndex > -1) {
            // Update quantity
            cart.items[itemIndex].quantity += quantity;
        } else {
            // Add new item
            cart.items.push({ product: productId, quantity });
        }

        await cart.save();
    }

    cart = await Cart.findById(cart._id).populate({
        path: 'items.product',
        select: 'name price images stock',
    });

    res.json({
        success: true,
        data: cart,
        message: 'Item added to cart',
    });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
export const updateCartItem = asyncHandler(async (req, res) => {
    const { quantity } = req.body;
    const { itemId } = req.params;

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        res.status(404);
        throw new Error('Cart not found');
    }

    const itemIndex = cart.items.findIndex(
        (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
        res.status(404);
        throw new Error('Item not found in cart');
    }

    // Check stock
    const product = await Product.findById(cart.items[itemIndex].product);

    if (product.stock < quantity) {
        res.status(400);
        throw new Error('Not enough stock');
    }

    if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
    } else {
        cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();

    cart = await Cart.findById(cart._id).populate({
        path: 'items.product',
        select: 'name price images stock',
    });

    res.json({
        success: true,
        data: cart,
    });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
export const removeFromCart = asyncHandler(async (req, res) => {
    const { itemId } = req.params;

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        res.status(404);
        throw new Error('Cart not found');
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    await cart.save();

    cart = await Cart.findById(cart._id).populate({
        path: 'items.product',
        select: 'name price images stock',
    });

    res.json({
        success: true,
        data: cart,
        message: 'Item removed from cart',
    });
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = asyncHandler(async (req, res) => {
    let cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
        cart.items = [];
        await cart.save();
    }

    res.json({
        success: true,
        message: 'Cart cleared',
    });
});
