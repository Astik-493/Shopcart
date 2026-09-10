import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import customerRoutes from './routes/customer.routes.js'
import cookieParser from 'cookie-parser'

dotenv.config()

const app = express()
const PORT = 8001

app.use(express.json())
app.use(cookieParser())

app.use('/api/customers', customerRoutes)

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