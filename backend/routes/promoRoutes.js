import express from 'express';
import {
    getPromoCards,
    createOrUpdatePromoCard,
    deletePromoCard
} from '../controllers/promoController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getPromoCards)
    .post(protect, admin, createOrUpdatePromoCard);

router.route('/:id')
    .delete(protect, admin, deletePromoCard);

export default router;
