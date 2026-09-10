import jwt from 'jsonwebtoken'

export const generateToken = (res, customer) => {
    const token = jwt.sign(
        { id: customer._id, email: customer.email },
        process.env.JWT_SECRET || 'shopkart_secret_key_12345',
        { expiresIn: '1d' }
    )

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    })

    return token
}
