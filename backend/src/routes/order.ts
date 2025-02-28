import { Router } from 'express'
import {
    createOrder,
    deleteOrder,
    getOrderByNumber,
    getOrderCurrentUserByNumber,
    getOrders,
    getOrdersCurrentUser,
    updateOrder,
} from '../controllers/order'
import auth, { roleGuardMiddleware } from '../middlewares/auth'
import { validateOrderBody } from '../middlewares/validations'
import { Role } from '../models/user'

const orderRouter = Router()

orderRouter.post('/', auth, validateOrderBody, createOrder)
orderRouter.get('/all', auth, roleGuardMiddleware(Role.Admin), getOrders)
orderRouter.get('/all/me', auth, getOrdersCurrentUser)
orderRouter.get('/:orderNumber', auth, getOrderByNumber)
orderRouter.get('/me/:orderNumber', auth, getOrderCurrentUserByNumber)
orderRouter.patch('/:orderNumber', auth, updateOrder)

orderRouter.delete('/:id', auth, deleteOrder)

export default orderRouter
