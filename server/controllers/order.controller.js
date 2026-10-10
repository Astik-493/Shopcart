import crypto from 'crypto'
import mongoose from 'mongoose'
import Product from '../models/product.model.js'
import Customer from '../models/customer.model.js'
import Order from '../models/order.model.js'
import razorpay from '../config/razorpay.js'

export const createPaymentOrder = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id).populate('cart.product')
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
            const product = item.product
            if (!product || !product._id) {
                return res.status(400).json({
                    success: false,
                    message: "A product in your cart is no longer available"
                })
            }

            const quantity = Number(item.quantity)
            if (isNaN(quantity) || quantity < 1) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid quantity for ${product.name || 'product'}`
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

        // 4. Instantiate Shopkart Order document
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
            status: "PENDING_PAYMENT",
            paymentStatus: "PENDING"
        })

        // 5. Create Razorpay order (amount in paise)
        const options = {
            amount: Math.round(totalAmount * 100),
            currency: "INR",
            receipt: order._id.toString()
        }

        let razorpayOrder
        try {
            razorpayOrder = await razorpay.orders.create(options)
        } catch (razorpayError) {
            console.error("Razorpay order creation error:", razorpayError)
            return res.status(500).json({
                success: false,
                message: "Failed to create payment order with Razorpay. Please verify Razorpay credentials."
            })
        }

        // 6. Save Razorpay Order ID to Shopkart Order
        order.razorpayOrderId = razorpayOrder.id
        await order.save()

        // 7. Return safe response without secret
        return res.status(201).json({
            success: true,
            shopKartOrderId: order._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency || "INR",
            key: process.env.RAZORPAY_KEY_ID
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

export const getMyOrders = async (req, res) => {
    try {
        const userId = req.user._id

        const orders = await Order.find({ user: userId }).sort({ createdAt: -1 })

        return res.status(200).json({
            success: true,
            orders
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        })
    }
}

export const verifyPayment = async (req, res) => {
    try {
        const {
            shopKartOrderId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body || {}

        // 1. Validate that all four fields are present
        if (!shopKartOrderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "All payment verification fields (shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature) are required"
            })
        }

        // 2. Validate MongoDB ObjectId format
        if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid shopKartOrderId format"
            })
        }

        // 3. Find order by shopKartOrderId and the authenticated user's ID
        const order = await Order.findOne({
            _id: shopKartOrderId,
            user: req.user._id
        })

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            })
        }

        // 4. Handle repeat requests safely (if already successfully paid)
        if (order.paymentStatus === 'PAID') {
            return res.status(200).json({
                success: true,
                message: "Payment has already been verified",
                shopKartOrderId: order._id,
                order
            })
        }

        // 5. Compare razorpay_order_id against the razorpayOrderId stored on the order
        if (!order.razorpayOrderId || order.razorpayOrderId !== razorpay_order_id) {
            return res.status(400).json({
                success: false,
                message: "Razorpay order ID mismatch"
            })
        }

        // 6. Verify HMAC SHA-256 signature using RAZORPAY_KEY_SECRET
        const secret = process.env.RAZORPAY_KEY_SECRET
        if (!secret) {
            console.error("RAZORPAY_KEY_SECRET is not configured on server")
            return res.status(500).json({
                success: false,
                message: "Payment configuration error on server"
            })
        }

        const message = `${order.razorpayOrderId}|${razorpay_payment_id}`
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(message)
            .digest('hex')

        const isHexSignature = /^[a-fA-F0-9]{64}$/.test(razorpay_signature)

        const expectedBuffer = Buffer.from(expectedSignature, 'hex')
        const receivedBuffer = isHexSignature
            ? Buffer.from(razorpay_signature, 'hex')
            : Buffer.alloc(0)

        const isValidSignature =
            isHexSignature &&
            expectedBuffer.length === receivedBuffer.length &&
            crypto.timingSafeEqual(expectedBuffer, receivedBuffer)

        if (!isValidSignature) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature"
            })
        }

        // 7. Verification succeeded: update order status
        order.paymentStatus = 'PAID'
        order.status = 'PLACED'
        order.razorpayPaymentId = razorpay_payment_id
        await order.save()

        // 8. Clear the authenticated customer's database cart
        const customer = await Customer.findById(req.user._id)
        if (customer) {
            customer.cart = []
            await customer.save()
        }

        // 9. Return success response
        return res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            shopKartOrderId: order._id,
            order
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        })
    }
}



