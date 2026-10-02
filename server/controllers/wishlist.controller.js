import mongoose from 'mongoose'
import Product from '../models/product.model.js'

export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params

        // Validate that productId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID format"
            })
        }

        // Check if product exists
        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            })
        }

        // Get authenticated user from middleware
        const customer = req.user

        // Check whether the product is already in the user's wishlist
        const isAlreadyInWishlist = customer.wishlist.some(
            (id) => id.toString() === productId
        )

        if (isAlreadyInWishlist) {
            return res.status(409).json({
                success: false,
                message: "Product already in wishlist"
            })
        }

        // Add product ID to wishlist and save
        customer.wishlist.push(productId)
        await customer.save()

        return res.status(200).json({
            success: true,
            message: "Product added to wishlist"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        })
    }
}
