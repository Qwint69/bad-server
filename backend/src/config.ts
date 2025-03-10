import { CookieOptions } from 'express'
import rateLimit from 'express-rate-limit'
import ms from 'ms'

export const { PORT = '3000' } = process.env
export const { ORIGIN_ALLOW = 'http://localhost:5173' } = process.env
export const { DB_ADDRESS = 'mongodb://127.0.0.1:27017/weblarek' } = process.env
export const { JWT_SECRET = 'JWT_SECRET' } = process.env
export const ACCESS_TOKEN = {
    secret: process.env.AUTH_ACCESS_TOKEN_SECRET || 'secret-dev',
    expiry: process.env.AUTH_ACCESS_TOKEN_EXPIRY || '10m',
}
export const REFRESH_TOKEN = {
    secret: process.env.AUTH_REFRESH_TOKEN_SECRET || 'secret-dev',
    expiry: process.env.AUTH_REFRESH_TOKEN_EXPIRY || '7d',
    cookie: {
        name: 'refreshToken',
        options: {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            maxAge: ms(process.env.AUTH_REFRESH_TOKEN_EXPIRY || '7d'),
            path: '/',
        } as CookieOptions,
    },
}
export const corsConfig = {
    origin: ORIGIN_ALLOW,
    credentials: true,
    allowedHeaders: [
        'Access-Control-Allow-Origin',
        'Origin',
        'Content-Type',
        'Authorization',
    ],
}
export const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 49,
    message: 'Too many requests, please try again later.',
})
