import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    image: {
        type: String
    }
}, { _id: false })

const shippingAddressSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    addressLine1: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    pincode: {
        type: String,
        required: true,
        trim: true
    }
}, { _id: false })

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    items: {
        type: [orderItemSchema],
        required: true,
        validate: [v => Array.isArray(v) && v.length > 0, 'Order must contain at least one item']
    },
    shippingAddress: {
        type: shippingAddressSchema,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ["PENDING_PAYMENT", "PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"],
        default: "PENDING_PAYMENT"
    },
    paymentStatus: {
        type: String,
        enum: ["PENDING", "PAID", "FAILED"],
        default: "PENDING"
    },
    razorpayOrderId: {
        type: String
    },
    razorpayPaymentId: {
        type: String
    }
}, {
    timestamps: true
})

const Order = mongoose.model('Order', orderSchema)

export default Order
