import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
    },
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    }
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    orderItems: [orderItemSchema],
    shippingAddress: {
        fullName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, required: true }
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['card', 'razorpay', 'cashfree', 'cod'],
        default: 'card'
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ['Pending', 'Paid', 'Failed'],
        default: 'Pending'
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    cashfreeOrderId: { type: String },
    cashfreePaymentSessionId: { type: String },
    paymentResult: {
        id: String,
        status: String,
        updateTime: String,
        emailAddress: String,
        razorpay_signature: String
    },
    itemsPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    taxPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    isPaid: {
        type: Boolean,
        required: true,
        default: false
    },
    paidAt: {
        type: Date
    },
    isDelivered: {
        type: Boolean,
        required: true,
        default: false
    },
    deliveredAt: {
        type: Date
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    orderTrackingStatus: {
        type: String,
        default: 'Order Placed'
    },
    trackingNumber: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Generate order and invoice number
orderSchema.pre('save', async function () {
    if (this.isNew) {
        const count = await mongoose.model('Order').countDocuments();
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        this.orderNumber = `ORD-${Date.now()}-${count + 1}`;
        this.invoiceNumber = `INV-${dateStr}-${count + 1}`;
    }
});

orderSchema.add({
    orderNumber: {
        type: String,
        unique: true
    },
    invoiceNumber: {
        type: String,
        unique: true
    }
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
