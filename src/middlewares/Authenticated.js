const jwt = require('jsonwebtoken')

function CheckToken(request, response, next) {
    const authHeader = request.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return response.status(401).json({ message: 'Token is missed' })
    }

    try {
        const secret = process.env.SECRET

        jwt.verify(token, secret)

        next()
    } catch (error) {
        return response.status(400).json({ message: 'Unauthorization Token' })
    }
}

module.exports = CheckToken