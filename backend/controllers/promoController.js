import asyncHandler from 'express-async-handler';
import PromoCard from '../models/PromoCard.js';

// @desc    Get all active promo cards (or all if admin)
// @route   GET /api/promos
// @access  Public
export const getPromoCards = asyncHandler(async (req, res) => {
    const isAdminView = req.query.all === 'true';
    
    let promos;
    if (isAdminView) {
        promos = await PromoCard.find({}).sort('slot');
    } else {
        promos = await PromoCard.find({ isActive: true }).sort('slot');
    }
    
    res.json({ success: true, data: promos });
});

// @desc    Create or update a promo card for a slot
// @route   POST /api/promos
// @access  Private/Admin
export const createOrUpdatePromoCard = asyncHandler(async (req, res) => {
    const { slot, title, subtitle, image, link, isActive } = req.body;

    const slotNum = Number(slot);
    if (!slotNum || slotNum < 1 || slotNum > 8) {
        res.status(400);
        throw new Error('Valid slot number (1-8) is required');
    }

    let promo = await PromoCard.findOne({ slot: slotNum });

    if (promo) {
        // Update
        promo.title = title || promo.title;
        promo.subtitle = subtitle !== undefined ? subtitle : promo.subtitle;
        promo.image = image || promo.image;
        promo.link = link !== undefined ? link : promo.link;
        promo.isActive = isActive !== undefined ? isActive : promo.isActive;
        
        await promo.save();
        res.json({ success: true, data: promo });
    } else {
        // Create
        promo = await PromoCard.create({
            slot: slotNum,
            title,
            subtitle,
            image,
            link,
            isActive: isActive !== false
        });
        res.status(201).json({ success: true, data: promo });
    }
});

// @desc    Delete a promo card (resets slot to default)
// @route   DELETE /api/promos/:id
// @access  Private/Admin
export const deletePromoCard = asyncHandler(async (req, res) => {
    const promo = await PromoCard.findById(req.params.id);

    if (promo) {
        await promo.deleteOne();
        res.json({ success: true, message: 'Promo card removed' });
    } else {
        res.status(404);
        throw new Error('Promo card not found');
    }
});
