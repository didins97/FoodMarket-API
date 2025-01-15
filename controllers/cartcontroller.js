const db = require('../models');
const response = require('../helpers/response');

const Cart = db.Cart;

exports.getCarts = async (req, res) => {
    try {
        const carts = await Cart.findAll({ include: { all: true }, where: { user_id: req.userData.data.id } });
        response.successResponse(res, 'success', 'Get all carts successfully', carts, 200);
    } catch (error) {
        console.error(error);
        response.errorResponse(res, 'error', 'Failed to get carts', 500);
    }
}

exports.getCartById = async (req, res) => {
    try {
        const cart = await Cart.findByPk(req.params.id, { include: { all: true } });

        if (!cart) {
            response.errorResponse(res, 'error', 'Cart not found', 404);
        }

        if (cart.user_id !== req.userData.data.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        response.successResponse(res, 'success', 'Get cart by id successfully', cart, 200);
    } catch (error) {
        console.error(error);
        response.errorResponse(res, 'error', 'Failed to get cart by id', 500);
    }
}

exports.createCart = async (req, res) => {
    // console.log(req.body.food_id, req.userData.data.id);
    try {
        const cart = await Cart.findOne(
            {
                where: {
                    food_id: req.body.food_id,
                    user_id: req.userData.data.id
                }
            },
            { include: { all: true } }
        )

        if (!cart) {
            response.errorResponse(res, 'error', 'Cart not found', null, 404);
        }

        if (cart) {
            cart.quantity += 1;
            await cart.save();
        } else {
            const newCart = await Cart.create({
                food_id: req.body.food_id,
                user_id: req.userData.data.id,
                quantity: req.body.quantity
            });
            await newCart.save();
        }

        response.successResponse(res, 'success', 'Cart created successfully', cart, 201);
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            response.errorResponse(res, 'error', 'Validation error', error.errors, 400);
        }
        response.errorResponse(res, 'error', 'Failed to create cart', 500);

        console.log(error);
    }
}

exports.updateQtyCart = async (req, res) => {
    try {
        const cart = await Cart.findByPk(req.params.id);
        
        if (!cart) {
            response.errorResponse(res, 'error', 'Cart not found', 404);
        } 

        if (cart.user_id !== req.userData.data.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        cart.quantity = req.body.quantity;
        await cart.save();

        response.successResponse(res, 'success', 'Cart updated successfully', cart, 200);
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            response.errorResponse(res, 'error', 'Validation error', error.errors, 400);
        }
        console.error(error);
    }
}

exports.deleteCart = async (req, res) => {
    try {
        const cart = await Cart.findByPk(req.params.id);

        if (!cart) {
            response.errorResponse(res, 'error', 'Cart not found', 404);
        }

        if (cart.user_id !== req.userData.data.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        await cart.destroy();
        response.successResponse(res, 'success', 'Cart deleted successfully', cart, 200);
    } catch (error) {
        console.error(error);
        response.errorResponse(res, 'error', 'Failed to delete cart', 500);
    }
}