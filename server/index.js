import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import mongoose from 'mongoose'
import customerRoutes from './routes/customer.routes.js'
import productRoutes from './routes/product.routes.js'
import wishlistRoutes from './routes/wishlist.routes.js'
import cartRoutes from './routes/cart.routes.js'
import orderRoutes from './routes/order.routes.js'
import cookieParser from 'cookie-parser'

const app = express()
const PORT = 8001

app.use((req, res, next) => {
    const origin = req.headers.origin || 'http://localhost:5173'
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200)
    }
    next()
})

app.use(express.json())
app.use(cookieParser())

app.use('/api/customers', customerRoutes)
// app.use('/api/products', productRoutes)
app.use('/products', productRoutes)
app.use('/wishlist', wishlistRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/cart', cartRoutes)
app.use('/api/cart', cartRoutes)
app.use('/orders', orderRoutes)
app.use('/api/orders', orderRoutes)


mongoose.connect(process.env.dbUrl)
    .then(() => {
        console.log('DB Connected')

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        })
    })
    .catch((err) => {
        console.log('MongoDB connection failed:')
        console.log(err)
    })