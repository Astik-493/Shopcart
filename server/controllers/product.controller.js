import Product from '../models/product.model.js'

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, image, stock } = req.body

        // Check for missing required fields
        if (!name || !description || price === undefined || price === null || !category || !image || stock === undefined || stock === null) {
            return res.status(400).json({
                success: false,
                message: "All fields (name, description, price, category, image, stock) are required"
            })
        }

        // Validate price
        if (typeof price !== 'number' || price <= 0) {
            return res.status(400).json({
                success: false,
                message: "Price must be a number greater than 0"
            })
        }

        // Validate stock
        if (typeof stock !== 'number' || stock < 0) {
            return res.status(400).json({
                success: false,
                message: "Stock must be a number greater than or equal to 0"
            })
        }

        // Create product in MongoDB using existing Product model
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
