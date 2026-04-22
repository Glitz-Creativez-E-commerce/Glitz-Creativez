import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    name: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a product name'],
        trim: true,
        maxlength: [200, 'Name cannot be more than 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [2000, 'Description cannot be more than 2000 characters']
    },
    price: {
        type: Number,
        required: [true, 'Please add a price'],
        min: [0, 'Price must be positive']
    },
    originalPrice: {
        type: Number,
        default: 0
    },
    images: [{
        type: String,
        required: true
    }],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Category'
    },
    sizes: [{
        name: {
            type: String,
            required: [true, 'Please provide a size name (e.g., Small, XL)']
        },
        price: {
            type: Number,
            required: [true, 'Please provide the exact price for this size variant']
        },
        image: {
            type: String,
            default: ''
        }
    }],
    stock: {
        type: Number,
        required: [true, 'Please add stock quantity'],
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    reviews: [reviewSchema],
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    numReviews: {
        type: Number,
        default: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    soldCount: {
        type: Number,
        default: 0
    },
    tags: [{
        type: String
    }],
    specifications: [{
        key: String,
        value: String
    }]
}, {
    timestamps: true
});

// Index for search
productSchema.index({ name: 'text', description: 'text' });

// Calculate average rating
productSchema.methods.calculateAverageRating = function () {
    if (this.reviews.length === 0) {
        this.rating = 0;
        this.numReviews = 0;
    } else {
        this.rating = this.reviews.reduce((acc, item) => item.rating + acc, 0) / this.reviews.length;
        this.numReviews = this.reviews.length;
    }
    return this.save();
};

const Product = mongoose.model('Product', productSchema);

export default Product;
