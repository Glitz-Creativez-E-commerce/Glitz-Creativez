import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import dotenv from 'dotenv';
dotenv.config();

const getCashfreeHeaders = () => {
    if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
        throw new Error('Cashfree App ID or Secret Key is missing in .env file.');
    }
    return {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': process.env.CASHFREE_APP_ID,
        'x-client-secret': process.env.CASHFREE_SECRET_KEY,
    };
};

const getCashfreeBaseUrl = () => {
    return process.env.CASHFREE_ENV === 'production'
        ? 'https://api.cashfree.com/pg'
        : 'https://sandbox.cashfree.com/pg';
};

// @desc    Create Cashfree Order Session
// @route   POST /api/orders/:id/cashfree
// @access  Private
export const createCashfreeOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    if (order.isPaid) {
        res.status(400);
        throw new Error('Order is already paid');
    }

    // Cashfree order_id must be unique. We append a timestamp to ensure uniqueness if they retry paying
    const cashfreeOrderId = `CF_ORD_${order._id}_${Date.now()}`;
    const amount = Number(order.totalPrice.toFixed(2));

    const payload = {
        order_amount: amount,
        order_currency: 'INR',
        order_id: cashfreeOrderId,
        customer_details: {
            customer_id: order.user.toString(),
            customer_name: order.shippingAddress.fullName || req.user.name || 'Customer',
            customer_email: order.shippingAddress.email || req.user.email,
            customer_phone: order.shippingAddress.phone || '9999999999', // Cashfree requires a 10-digit phone
        },
        order_meta: {
            return_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/order-success/${order._id}`
        }
    };

    try {
        const response = await fetch(`${getCashfreeBaseUrl()}/orders`, {
            method: 'POST',
            headers: getCashfreeHeaders(),
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to create order on Cashfree');
        }

        // Save Cashfree order references to the order document
        order.cashfreeOrderId = cashfreeOrderId;
        order.cashfreePaymentSessionId = data.payment_session_id;
        await order.save();

        res.json({
            payment_session_id: data.payment_session_id,
            cf_order_id: data.cf_order_id,
            order_id: cashfreeOrderId,
        });
    } catch (error) {
        res.status(500);
        throw new Error('Cashfree order creation failed: ' + error.message);
    }
});

// @desc    Verify Cashfree Payment Status
// @route   POST /api/orders/:id/verify-payment
// @access  Private
export const verifyCashfreePayment = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    if (!order.cashfreeOrderId) {
        res.status(400);
        throw new Error('No Cashfree Order reference found for this order');
    }

    try {
        const response = await fetch(`${getCashfreeBaseUrl()}/orders/${order.cashfreeOrderId}`, {
            method: 'GET',
            headers: getCashfreeHeaders(),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch payment status from Cashfree');
        }

        // Check if Cashfree status is PAID
        if (data.order_status === 'PAID') {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentStatus = 'Paid';
            order.paymentResult = {
                id: data.cf_order_id,
                status: 'success',
                updateTime: new Date().toISOString(),
                emailAddress: order.shippingAddress.email || req.user.email
            };

            const updatedOrder = await order.save();

            res.json({
                success: true,
                message: 'Payment verified successfully',
                order: updatedOrder
            });
        } else {
            res.status(400);
            throw new Error(`Payment verification failed. Current status: ${data.order_status}`);
        }
    } catch (error) {
        res.status(500);
        throw new Error('Cashfree payment verification failed: ' + error.message);
    }
});
