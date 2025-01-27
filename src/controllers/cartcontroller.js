const db = require('../models');
const { successResponse, errorResponse } = require('../helpers/response');

const Cart = db.Cart;

exports.getCarts = async (req, res) => {
    try {
        const carts = await Cart.findAll({ include: { all: true }, where: { user_id: req.userData.data.id } });
        return successResponse(res, 'success', 'Get all carts successfully', carts, 200);
    } catch (error) {
        console.error(error);
        return errorResponse(res, 'error', 'Failed to get carts', error, 500);
    }
}

exports.getCartById = async (req, res) => {
    try {
        const cart = await Cart.findByPk(req.params.id, { include: { all: true } });

        if (!cart) {
            return errorResponse(res, 'error', 'Cart not found', 404);
        }

        if (cart.user_id !== req.userData.data.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        return successResponse(res, 'success', 'Get cart by id successfully', cart, 200);
    } catch (error) {
        console.error(error);
        return errorResponse(res, 'error', 'Failed to get cart by id', error, 500);
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
            return errorResponse(res, 'error', 'Cart not found', null, 404);
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

        return successResponse(res, 'success', 'Cart created successfully', cart, 201);
    } catch (error) {
        console.log(error);
        return errorResponse(res, 'error', 'Failed to create cart', error, 500);
    }
}

exports.updateQtyCart = async (req, res) => {
    try {
        const cart = await Cart.findByPk(req.params.id);
        
        if (!cart) {
            return errorResponse(res, 'error', 'Cart not found', 404);
        } 

        if (cart.user_id !== req.userData.data.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        cart.quantity = req.body.quantity;
        await cart.save();

        return successResponse(res, 'success', 'Cart updated successfully', cart, 200);
    } catch (error) {
        console.error(error);
        return errorResponse(res, 'error', 'Failed to create cart', error, 500);
    }
}

exports.deleteCart = async (req, res) => {
    try {
        const cart = await Cart.findByPk(req.params.id);

        if (!cart) {
            return errorResponse(res, 'error', 'Cart not found', 404);
        }

        if (cart.user_id !== req.userData.data.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        await cart.destroy();
        return successResponse(res, 'success', 'Cart deleted successfully', cart, 200);
    } catch (error) {
        console.error(error);
        return errorResponse(res, 'error', 'Failed to delete cart', error, 500);
    }
}