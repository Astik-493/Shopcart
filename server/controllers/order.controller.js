import mongoose from 'mongoose'
import Product from '../models/product.model.js'
import Customer from '../models/customer.model.js'
import Order from '../models/order.model.js'

export const createPaymentOrder = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id)
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            })
        }

        // 1. Validate shippingAddress in request body
        const { shippingAddress } = req.body || {}
        if (!shippingAddress || typeof shippingAddress !== 'object') {
            return res.status(400).json({
                success: false,
                message: "Shipping address is required"
            })
        }

        const fullName = shippingAddress.fullName?.trim()
        const phone = shippingAddress.phone?.trim()
        const address = (shippingAddress.address || shippingAddress.addressLine1)?.trim()
        const city = shippingAddress.city?.trim()
        const state = shippingAddress.state?.trim()
        const pincode = shippingAddress.pincode?.trim()

        if (!fullName || !phone || !address || !city || !state || !pincode) {
            return res.status(400).json({
                success: false,
                message: "All shipping address fields (fullName, phone, address, city, state, pincode) are required"
            })
        }

        // 2. Validate user's cart in database
        if (!customer.cart || customer.cart.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty"
            })
        }

        let totalAmount = 0
        const orderItems = []

        // 3. For every cart item, verify product existence and current stock
        for (const item of customer.cart) {
            const productId = item.product
            if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product in cart"
                })
            }

            const product = await Product.findById(productId)
            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: "A product in your cart is no longer available"
                })
            }

            const quantity = Number(item.quantity)
            if (isNaN(quantity) || quantity < 1) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid quantity for ${product.name}`
                })
            }

            // Stock verification against MongoDB current stock
            if (product.stock < quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}.`
                })
            }

            // Calculate item subtotal based on server source of truth
            totalAmount += product.price * quantity

            orderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: quantity,
                image: product.image
            })
        }

        // 4. Create Order document with snapshotted items and server-calculated total
        const order = new Order({
            user: customer._id,
            items: orderItems,
            shippingAddress: {
                fullName,
                phone,
                address,
                addressLine1: address,
                city,
                state,
                pincode
            },
            totalAmount,
            orderStatus: 'Pending'
        })

        await order.save()

        return res.status(201).json({
            success: true,
            message: "Order created successfully",
            order
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        })
    }
}

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            })
        }

        const order = await Order.findOne({
            _id: id,
            user: req.user._id
        })

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            })
        }

        return res.status(200).json({
            success: true,
            order
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        })
    }
}

