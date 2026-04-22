import express from 'express';
import {
    getProducts,
    getProductById,
    getFeaturedProducts,
    getBestSellingProducts,
    getRelatedProducts,
    createProductReview,
    getCategories,
    getProductsByCategory,
    createProduct,
    updateProduct,
    deleteProduct,
    getAdminProducts,
    deleteProductReview,
} from '../controllers/productController.js';
import { protect, optionalAuth, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/all').get(protect, admin, getAdminProducts);

// Public routes
router.get('/featured', getFeaturedProducts);
router.get('/bestsellers', getBestSellingProducts);
router.get('/categories', getCategories);

router.get('/category/:slug', getProductsByCategory);

router.route('/').get(optionalAuth, getProducts).post(protect, admin, createProduct);

router.get('/:id/related', getRelatedProducts);
router.post('/:id/reviews', protect, createProductReview);

router.route('/:id')
    .get(optionalAuth, getProductById)
    .put(protect, admin, updateProduct)
    .delete(protect, admin, deleteProduct);

router.route('/:id/reviews/:reviewId').delete(protect, admin, deleteProductReview);

export default router;
