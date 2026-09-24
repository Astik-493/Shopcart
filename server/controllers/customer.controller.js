import Customer from '../models/customer.model.js'
import bcrypt from 'bcrypt'
import { generateToken } from '../utils/generateToken.js'

export const registerCustomer = async (req, res) => {
    try {
        const { fullName, email, password, phone } = req.body

        // Check for missing fields
        if (!fullName || !email || !password || !phone) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            })
        }

        // Check if email already exists
        const existingCustomer = await Customer.findOne({ email: email.toLowerCase() })
        if (existingCustomer) {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            })
        }

        // Hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Create new customer
        const customer = new Customer({
            fullName,
            email: email.toLowerCase(),
            password: hashedPassword,
            phone
        })

        await customer.save()

        return res.status(201).json({
            success: true,
            message: "Customer registered successfully",
            customer: {
                _id: customer._id,
                fullName: customer.fullName,
                email: customer.email,
                phone: customer.phone
            }
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        })
    }
}

export const loginCustomer = async (req, res) => {
    try {
        const { email, password } = req.body

        // Check for missing fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            })
        }

        // Find customer by email
        const customer = await Customer.findOne({ email: email.toLowerCase() })
        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "User not registered"
            })
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, customer.password)
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            })
        }

        // Generate token and set in HttpOnly cookie
        generateToken(res, customer)

        return res.status(200).json({
            success: true,
            message: "Login successful"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        })
    }
}

export const getProfile = async (req, res) => {
    try {
        const customer = req.user

        return res.status(200).json({
            _id: customer._id,
            fullName: customer.fullName,
            email: customer.email,
            phone: customer.phone
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        })
    }
}

export const logoutCustomer = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        })

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        })
    }
}
