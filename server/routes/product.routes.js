import express from 'express'
import { createProduct } from '../controllers/product.controller.js'

const router = express.Router()

// Open route for product creation
router.post('/', createProduct)

export default router
