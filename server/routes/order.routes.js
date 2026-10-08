import express from 'express'
import { createPaymentOrder } from '../controllers/order.controller.js'
import { protectRoute } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.post('/create-payment-order', protectRoute, createPaymentOrder)

export default router
