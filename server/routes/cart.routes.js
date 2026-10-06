import express from 'express'
import {
    addToCart,
    getCart,
    updateCartItemQuantity,
    removeFromCart
} from '../controllers/cart.controller.js'
import { protectRoute } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.get('/', protectRoute, getCart)
router.post('/:productId', protectRoute, addToCart)
router.patch('/:productId', protectRoute, updateCartItemQuantity)
router.delete('/:productId', protectRoute, removeFromCart)

export default router
