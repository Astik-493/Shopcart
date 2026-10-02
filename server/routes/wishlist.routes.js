import express from 'express'
import { addToWishlist } from '../controllers/wishlist.controller.js'
import { protectRoute } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.post('/:productId', protectRoute, addToWishlist)

export default router
