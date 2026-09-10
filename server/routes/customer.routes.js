import express from 'express'
import {
    registerCustomer,
    loginCustomer,
    getProfile,
    logoutCustomer
} from '../controllers/customer.controller.js'
import { protectRoute } from '../middlewares/auth.middleware.js'

const router = express.Router()

// Public routes
router.post('/register', registerCustomer)
router.post('/login', loginCustomer)

// Protected routes
router.get('/me', protectRoute, getProfile)
router.post('/logout', protectRoute, logoutCustomer)

export default router
