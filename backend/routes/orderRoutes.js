import express from 'express';
import {
    createOrder,
    getMyOrders,
    getOrderById,
    updateOrderToPaid,
    updateOrderStatus,
    cancelOrder,
    getOrders,
} from '../controllers/orderController.js';
import {
    createRazorpayOrder,
    verifyRazorpayPayment
} from '../controllers/paymentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All order routes require authentication

router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrderById);
router.post('/:id/razorpay', createRazorpayOrder);
router.post('/:id/verify-payment', verifyRazorpayPayment);
router.put('/:id/pay', updateOrderToPaid);
router.put('/:id/status', admin, updateOrderStatus);
router.put('/:id/cancel', cancelOrder);
router.get('/admin/all', admin, getOrders);

export default router;
