import mongoose from 'mongoose';

const promoCardSchema = new mongoose.Schema({
    slot: {
        type: Number,
        required: [true, 'Please add a slot number (1-8)'],
        unique: true,
        min: 1,
        max: 8
    },
    title: {
        type: String,
        required: [true, 'Please add a promo headline'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    subtitle: {
        type: String,
        trim: true,
        maxlength: [100, 'Subtitle cannot be more than 100 characters']
    },
    image: {
        type: String,
        required: [true, 'Please add a banner image URL'],
        trim: true
    },
    link: {
        type: String,
        default: '/products',
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const PromoCard = mongoose.model('PromoCard', promoCardSchema);

export default PromoCard;
