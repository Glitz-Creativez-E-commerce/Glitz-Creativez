import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
    const pageSize = Number(req.query.limit) || 12;
    const page = Number(req.query.page) || 1;

    // Build query
    const query = { isActive: true };

    console.log('getProducts Debug:', {
        includeInactive: req.query.includeInactive,
        hasUser: !!req.user,
        isAdmin: req.user?.isAdmin
    });

    // Allow admins to see inactive products
    if (req.query.includeInactive === 'true' && req.user && req.user.isAdmin) {
        delete query.isActive;
        console.log('Admin detected, removing isActive filter');
    }

    // Category filter
    if (req.query.category) {
        query.category = req.query.category;
    }

    // Price filter
    if (req.query.minPrice || req.query.maxPrice) {
        query.price = {};
        if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
        if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }

    // Search
    if (req.query.search) {
        query.$text = { $search: req.query.search };
    }

    // Brand filter
    if (req.query.brand) {
        query.brand = req.query.brand;
    }

    // Rating filter
    if (req.query.rating) {
        query.rating = { $gte: Number(req.query.rating) };
    }

    // Featured filter
    if (req.query.featured === 'true') {
        query.featured = true;
    }

    // Sort
    let sort = {};
    switch (req.query.sort) {
        case 'price-asc':
            sort = { price: 1 };
            break;
        case 'price-desc':
            sort = { price: -1 };
            break;
        case 'rating':
            sort = { rating: -1 };
            break;
        case 'newest':
            sort = { createdAt: -1 };
            break;
        case 'name':
            sort = { name: 1 };
            break;
        case 'bestselling':
            sort = { soldCount: -1, rating: -1 };
            break;
        default:
            sort = { createdAt: -1 };
    }

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
        .populate('category', 'name slug')
        .sort(sort)
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json({
        success: true,
        data: products,
        page,
        pages: Math.ceil(count / pageSize),
        total: count,
    });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
        .populate('category', 'name slug')
        .populate('reviews.user', 'name avatar');

    if (product) {
        res.json({
            success: true,
            data: product,
        });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = asyncHandler(async (req, res) => {
    const limit = Number(req.query.limit) || 8;

    const products = await Product.find({ isActive: true, featured: true })
        .populate('category', 'name slug')
        .limit(limit)
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        data: products,
    });
});

// @desc    Get best selling products
// @route   GET /api/products/bestsellers
// @access  Public
export const getBestSellingProducts = asyncHandler(async (req, res) => {
    const limit = Number(req.query.limit) || 20;

    const products = await Product.find({ isActive: true })
        .populate('category', 'name slug')
        .sort({ soldCount: -1, rating: -1 })
        .limit(limit);

    res.json({
        success: true,
        data: products,
    });
});

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
export const getRelatedProducts = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    const relatedProducts = await Product.find({
        _id: { $ne: req.params.id },
        category: product.category,
        isActive: true,
    })
        .populate('category', 'name slug')
        .limit(4);

    res.json({
        success: true,
        data: relatedProducts,
    });
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
export const createProductReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
        res.status(400);
        throw new Error('Product already reviewed');
    }

    const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
    };

    product.reviews.push(review);
    await product.calculateAverageRating();

    res.status(201).json({
        success: true,
        message: 'Review added',
    });
});

// @desc    Get all categories
// @route   GET /api/products/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({ isActive: true }).sort('sequence');

    res.json({
        success: true,
        data: categories,
    });
});

// @desc    Get products by category
// @route   GET /api/products/category/:slug
// @access  Public
export const getProductsByCategory = asyncHandler(async (req, res) => {
    const category = await Category.findOne({ slug: req.params.slug });

    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }

    const pageSize = Number(req.query.limit) || 12;
    const page = Number(req.query.page) || 1;

    const count = await Product.countDocuments({ category: category._id, isActive: true });
    const products = await Product.find({ category: category._id, isActive: true })
        .populate('category', 'name slug')
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json({
        success: true,
        data: products,
        category,
        page,
        pages: Math.ceil(count / pageSize),
        total: count,
    });
});


// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
    const product = new Product({
        name: req.body.name,
        price: req.body.price,
        user: req.user._id,
        images: req.body.images,
        category: req.body.category,
        countInStock: req.body.countInStock,
        numReviews: 0,
        description: req.body.description,
        stock: req.body.stock,
        sizes: req.body.sizes || [],
    });

    const createdProduct = await product.save();
    res.status(201).json({
        success: true,
        data: createdProduct,
    });
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
    const {
        name,
        price,
        description,
        images,
        brand,
        category,
        countInStock,
        stock,
        featured,
        isActive,
        sizes,
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        product.name = name || product.name;
        product.price = price || product.price;
        product.description = description || product.description;
        product.images = images || product.images;
        product.category = category || product.category;
        product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;
        product.stock = stock !== undefined ? stock : product.stock;
        product.featured = featured !== undefined ? featured : product.featured;
        product.isActive = isActive !== undefined ? isActive : product.isActive;
        product.sizes = sizes !== undefined ? sizes : product.sizes;

        const updatedProduct = await product.save();
        res.json({
            success: true,
            data: updatedProduct,
        });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        await product.deleteOne();
        res.json({ success: true, message: 'Product removed' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Get all products (Admin)
// @route   GET /api/products/admin/all
// @access  Private/Admin
export const getAdminProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json({ data: products });
});
// @desc    Delete product review
// @route   DELETE /api/products/:id/reviews/:reviewId
// @access  Private/Admin
export const deleteProductReview = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        const reviewIndex = product.reviews.findIndex(
            (r) => r._id.toString() === req.params.reviewId
        );

        if (reviewIndex === -1) {
            res.status(404);
            throw new Error('Review not found');
        }

        product.reviews.splice(reviewIndex, 1);
        product.numReviews = product.reviews.length;
        product.rating =
            product.reviews.length > 0
                ? product.reviews.reduce((acc, item) => item.rating + acc, 0) /
                product.reviews.length
                : 0;

        await product.save();
        res.json({ success: true, message: 'Review removed' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});
