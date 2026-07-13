import asyncHandler from 'express-async-handler';
import Banner from '../models/Banner.js';

// @desc    Get all active banners
// @route   GET /api/banners
// @access  Public
export const getBanners = asyncHandler(async (req, res) => {
    // If request contains query parameter "all" and user is admin, return all banners (active and inactive)
    const isAdminView = req.query.all === 'true';
    
    let banners;
    if (isAdminView) {
        banners = await Banner.find({}).sort('sequence');
    } else {
        banners = await Banner.find({ isActive: true }).sort('sequence');
    }
    
    res.json({ success: true, data: banners });
});

// @desc    Create a banner
// @route   POST /api/banners
// @access  Private/Admin
export const createBanner = asyncHandler(async (req, res) => {
    const { title, subtitle, description, image, link, buttonText, sequence, isActive } = req.body;

    const banner = await Banner.create({
        title,
        subtitle,
        description,
        image,
        link,
        buttonText,
        sequence: Number(sequence) || 0,
        isActive: isActive !== false
    });

    if (banner) {
        res.status(201).json({
            success: true,
            data: banner,
        });
    } else {
        res.status(400);
        throw new Error('Invalid banner data');
    }
});

// @desc    Update a banner
// @route   PUT /api/banners/:id
// @access  Private/Admin
export const updateBanner = asyncHandler(async (req, res) => {
    const banner = await Banner.findById(req.params.id);

    if (banner) {
        banner.title = req.body.title || banner.title;
        banner.subtitle = req.body.subtitle !== undefined ? req.body.subtitle : banner.subtitle;
        banner.description = req.body.description !== undefined ? req.body.description : banner.description;
        banner.image = req.body.image || banner.image;
        banner.link = req.body.link !== undefined ? req.body.link : banner.link;
        banner.buttonText = req.body.buttonText !== undefined ? req.body.buttonText : banner.buttonText;
        banner.sequence = req.body.sequence !== undefined ? Number(req.body.sequence) : banner.sequence;
        banner.isActive = req.body.isActive !== undefined ? req.body.isActive : banner.isActive;

        const updatedBanner = await banner.save();
        res.json({
            success: true,
            data: updatedBanner,
        });
    } else {
        res.status(404);
        throw new Error('Banner not found');
    }
});

// @desc    Delete a banner
// @route   DELETE /api/banners/:id
// @access  Private/Admin
export const deleteBanner = asyncHandler(async (req, res) => {
    const banner = await Banner.findById(req.params.id);

    if (banner) {
        await banner.deleteOne();
        res.json({ success: true, message: 'Banner removed' });
    } else {
        res.status(404);
        throw new Error('Banner not found');
    }
});
