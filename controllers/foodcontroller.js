const { successResponse, errorResponse } = require('../helpers/response');
const db = require('../models');

const Food = db.Food;

exports.getFoods = async (req, res) => {
    try {
        const foods = await Food.findAll({include: {all: true}});
        return successResponse(res, 'success', 'Get all foods successfully', foods, 200);
    } catch (error) {
        console.error(error);
        return errorResponse(res, 'error', 'Failed to get foods', 500);
    }
}

exports.getFoodById = async (req, res) => {
    // console.log(req.params.id);
    try {
        const food = await Food.findByPk(req.params.id, {include: {all: true}});
        if (!food) {
            return errorResponse(res, 'success', 'Food not found', null, 404)
        }
        return successResponse(res, 'success', 'Get food by id successfully', food, 200);
    } catch (error) {
        console.error(error);
        return errorResponse(res, 'error', 'Failed to get food by id', 500);
    }
}

exports.createFood = async (req, res) => {
    const { name, price, image, category_id } = req.body;
    try {
        const food = await Food.create({ name, price, image, category_id });
        return successResponse(res, 'success', 'Create food successfully', food, 200);
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            return errorResponse(res, 'error', 'Validation error', error.errors, 400);
        }
        return errorResponse(res, 'error', 'Failed to create food', 500);
    }
}

exports.updateFood = async (req, res) => {
    const id = req.params.id;
    const { name, price, image, category_id } = req.body;
    try {
        const food = await Food.findByPk(id);
        if (!food) {
            return errorResponse(res, 'error', 'Food not found', 404);
        }
        food.name = name ? name : food.name;
        food.price = price ? price : food.price;
        food.image = image ? image : food.image;
        food.category_id = category_id ? category_id : food.category_id;
        await food.save();

        return successResponse(res, 'success', 'Food updated successfully', food, 200);

    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            return errorResponse(res, 'error', 'Validation error', error.errors, 400);
        }

        return errorResponse(res, 'error', 'Failed to update food', 500);
    }
}

exports.deleteFood = async (req, res) => {
    const id = req.params.id;
    try {
        const food = await Food.findByPk(id);
        if (!food) {
            return response.errorResponse(res, 'error', 'Food not found', 404);
        }
        await food.destroy();
        return successResponse(res, 'success', 'Food deleted successfully', null, 200);
    } catch (error) {
        return errorResponse(res, 'error', 'Failed to delete food', 500);
    }
}