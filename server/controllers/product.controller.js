import mongoose from 'mongoose'
import Product from '../models/product.model.js'

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, image, stock } = req.body

        if (!name || !description || price === undefined || price === null || !category || !image || stock === undefined || stock === null) {
            return res.status(400).json({
                success: false,
                message: "All fields (name, description, price, category, image, stock) are required"
            })
        }

        if (typeof price !== 'number' || price <= 0) {
            return res.status(400).json({
                success: false,
                message: "Price must be a number greater than 0"
            })
        }

        if (typeof stock !== 'number' || stock < 0) {
            return res.status(400).json({
                success: false,
                message: "Stock must be a number greater than or equal to 0"
            })
        }

        const product = await Product.create({
            name,
            description,
            price,
            category,
            image,
            stock
        })

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            product
        })
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: error.message
            })
        }
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        })
    }
}

export const getAllProducts = async (req, res) => {
    try {
        const { search, category, sort } = req.query
        const query = {}

        // Filter by name (case-insensitive search)
        if (search && search.trim()) {
            query.name = { $regex: search.trim(), $options: 'i' }
        }

        // Filter by category
        if (category && category.trim()) {
            query.category = { $regex: `^${category.trim()}$`, $options: 'i' }
        }

        let productQuery = Product.find(query).select('_id name price category image stock')

        // Apply price sorting if specified
        if (sort === 'price_asc') {
            productQuery = productQuery.sort({ price: 1 })
        } else if (sort === 'price_desc') {
            productQuery = productQuery.sort({ price: -1 })
        }

        const products = await productQuery

        return res.status(200).json({
            success: true,
            count: products.length,
            products
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        })
    }
}

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params

        // Check if ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID format"
            })
        }

        const product = await Product.findById(id)

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            })
        }

        return res.status(200).json({
            success: true,
            product
        })
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID format"
            })
        }
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        })
    }
}
