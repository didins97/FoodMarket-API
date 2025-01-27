const { response } = require('express');
const { successResponse, errorResponse } = require('../helpers/response');
const db = require('../models');

const Order = db.Order
const Food = db.Food
const OrderItem = db.OrderItem
const sequelize = db.sequelize

exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({ include: { all: true } });
        return successResponse(res, 'success', 'Get all orders successfuly', orders, 200);
    } catch (error) {
        console.log(error);
        return errorResponse(res, 'error', 'Failed get orders', null, 500)
    }
}

exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, { include: { all: true } });
        if (!order) {
            return errorResponse(res, 'error', 'Order not found', null, 404)
        }

        return successResponse(res, 'success', 'Get order successfuly', order, 200);
    } catch (error) {
        console.error(error);
        return errorResponse(res, 'error', 'Failed get order', null, 500)
    }
}

exports.createOrder = async (req, res) => {
    const { user_id, address, payment_method, order_data } = req.body;

    const t = await sequelize.transaction();

    try {
        const orderItems = [];
        let totalPrice = 0;

        for (const item of order_data) {
            const { food_id, price, qty } = item;

            const food = await Food.findByPk(food_id);

            if (!food) {
                return errorResponse(res, 'success', 'Food not found', null, 404);
            }

            if (food.stock < qty) {
                return errorResponse(res, 'error', `Insufficient stock. Available stock: ${food.stock}`, null, 400)
            }

            // kurangi stock di food
            food.stock -= qty;
            await food.save({ transaction: t })

            // menambahkan subtotal kedalam total price 
            const subTotal = qty * price;
            totalPrice += subTotal; 

            // memasuakan item
            orderItems.push({
                food_id: food_id, 
                price: price,
                qty: qty,
                subtotal: subTotal
            })
        }
        
        // create data order
        const order = await Order.create({
            total_price: totalPrice,
            user_id,
            address,
            payment_method,
            order_items: orderItems
        },{
            include: [{ model: OrderItem, as: 'order_items' }],
            transaction: t
        })

        await t.commit();

        return successResponse(res, 'success', 'Create order successfuly', order, 201);
    } catch (error) {
        console.error(error)
        await t.rollback();
    }
}

exports.updateStatusOrder = async (req, res) => {
    const id = req.params.id
    const status = req.body.status;

    try {
        const order = await Order.findByPk(id);

        if (!order) {
            return errorResponse(res, 'success', 'Order not found', null, 404);
        }
        
        order.status = status,
        await order.save();

        await order.reload({
            include: [{ model: OrderItem, as: 'order_items' }]
        });

        return successResponse(res, 'success', 'Update order status successfuly', order, 200);
    } catch (error) {
        console.error(error)
        return errorResponse(res, 'error', 'Failed updated status order', null, 500)
    }
}

exports.deleteOrder = async (req, res) => {
    const id = req.params.id

    try {
        const order = await Order.findByPk(id);

        if (!order) {
            return errorResponse(res, 'success', 'Order not found', null, 404);
        }
        
        await order.destroy()

        return successResponse(res, 'success', 'Delete order successfuly', null, 200);
    } catch (error) {
        console.error(error)
        return errorResponse(res, 'error', 'Failed delete order', null, 500)
    }
}