import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import customerRoutes from './routes/customer.routes.js'
import productRoutes from './routes/product.routes.js'
import wishlistRoutes from './routes/wishlist.routes.js'
import cookieParser from 'cookie-parser'

dotenv.config()

const app = express()
const PORT = 8001

app.use((req, res, next) => {
    const origin = req.headers.origin || 'http://localhost:5173'
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
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