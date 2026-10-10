import express from 'express'
import { createPaymentOrder, getOrderById, getMyOrders, verifyPayment } from '../controllers/order.controller.js'
import { protectRoute } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.get('/', protectRoute, getMyOrders)
router.post('/create-payment-order', protectRoute, createPaymentOrder)
router.post('/verify-payment', protectRoute, verifyPayment)
router.get('/:id', protectRoute, getOrderById)

export default router
