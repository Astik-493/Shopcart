import mongoose from 'mongoose'
import Product from '../models/product.model.js'
import Customer from '../models/customer.model.js'

export const getCart = async (req, res) => {
    try {
        const userId = req.user._id

        const customer = await Customer.findById(userId).populate({
            path: 'cart.product',
            select: 'name price image stock'
        })

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            })
        }

        const cart = customer.cart || []

        return res.status(200).json({
            success: true,
            cart
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        })
    }
}

export const addToCart = async (req, res) => {
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

        // Ensure cart is initialized
        if (!customer.cart) {
            customer.cart = []
        }

        // Find whether this product already exists in the user's cart
        const cartItemIndex = customer.cart.findIndex(
            (item) => item.product.toString() === productId
        )

        if (cartItemIndex > -1) {
            // Product already exists in cart
            const currentQuantity = customer.cart[cartItemIndex].quantity
            const newQuantity = currentQuantity + 1

            // Stock validation: check if new quantity exceeds product stock
            if (newQuantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: "Cannot add more items than available in stock"
                })
            }

            customer.cart[cartItemIndex].quantity = newQuantity
        } else {
            // Product is not in cart
            // Stock validation: check if product is in stock (at least 1 available)
            if (product.stock < 1) {
                return res.status(400).json({
                    success: false,
                    message: "Product is out of stock"
                })
            }

            customer.cart.push({
                product: productId,
                quantity: 1
            })
        }

        // Save the updated customer document
        await customer.save()

        return res.status(200).json({
            success: true,
            message: "Cart updated",
            cart: customer.cart
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        })
    }
}

export const updateCartItemQuantity = async (req, res) => {
    try {
        const { productId } = req.params
        const { quantity } = req.body

        // Validate that productId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID format"
            })
        }

        // Validate quantity (must be a number and at least 1)
        if (typeof quantity !== 'number' || isNaN(quantity) || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a valid number of at least 1"
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

        // Ensure cart is initialized
        if (!customer.cart) {
            customer.cart = []
        }

        // Find whether this product exists in the user's cart
        const cartItemIndex = customer.cart.findIndex(
            (item) => item.product.toString() === productId
        )

        if (cartItemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Product not in cart"
            })
        }

        // Stock validation: check if requested quantity exceeds product stock
        if (quantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: "Requested quantity exceeds available stock"
            })
        }

        // Update ONLY that cart item's quantity
        customer.cart[cartItemIndex].quantity = quantity

        // Save the updated customer document
        await customer.save()

        return res.status(200).json({
            success: true,
            message: "Cart updated successfully",
            cart: customer.cart
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        })
    }
}

export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params

        // Validate that productId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID format"
            })
        }

        // Get authenticated user from middleware
        const customer = req.user

        // Ensure cart is initialized
        if (!customer.cart) {
            customer.cart = []
        }

        // Find whether this product exists in the user's cart
        const cartItemIndex = customer.cart.findIndex(
            (item) => item.product.toString() === productId
        )

        if (cartItemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Product not in cart"
            })
        }

        // Remove only that product's cart entry
        customer.cart.splice(cartItemIndex, 1)

        // Save the updated customer document
        await customer.save()

        // Populate product information for the updated cart response
        await customer.populate({
            path: 'cart.product',
            select: 'name price image stock'
        })

        return res.status(200).json({
            success: true,
            message: "Product removed from cart",
            cart: customer.cart
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        })
    }
}


