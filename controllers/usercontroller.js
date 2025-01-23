const db = require('../models');
const { successResponse, errorResponse } = require('../helpers/response');

const User = db.User;

exports.getUsers = async (req, res) => {
    try {
        const users = await User.scope('withoutPassword').findAll();
        return successResponse(res, 'success', 'Get all users successfully', users, 200);
    } catch (error) {
        console.error(error);
        return errorResponse(res, 'error', 'Failed to get users', error, 500);
    }
}

exports.getUserById = async (req, res) => {
    // console.log(req.params.id);
    try {
        const user = await User.scope('withoutPassword').findByPk(req.params.id);
        if (!user) {
            return successResponse(res, 'error', 'User not found', null, 404)
        }

        return successResponse(res, 'success', 'Get user by id successfully', user, 200);
    } catch (error) {
        console.error(error);
        return errorResponse(res, 'error', 'Failed to get user by id', error, 500);
    }
}

exports.createUser = async (req, res) => {
    const { name, email, password, role, phone, address, city, country } = req.body;

    try {
        const user = await User.create({ name, email, password, role, phone, address, city, country });

        return successResponse(res, 'success', 'User created successfully', user, 201);
    } catch (error) {
        return errorResponse(res, 'error', 'Failed to create user', error, 500);
    }
}

exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, password, role, phone, address, city, country } = req.body;

    try {
        const user = await User.findByPk(id);
        if (!user) {
            return errorResponse(res, 'error', 'User not found', null, 404);
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.password = password || user.password;
        user.role = role || user.role;
        user.phone = phone || user.phone;
        user.address = address || user.address;
        user.city = city || user.city;
        user.country = country || user.country;

        await user.save();

        return successResponse(res, 'success', 'User updated successfully', user, 200);

    } catch (error) {
        return errorResponse(res, 'error', 'Failed to update user', error, 500);
    }
};

exports.deleteUser = async (req, res) => {
    const id = req.params.id;

    try {
        const user = await User.findByPk(id);
        if (!user) {
            return errorResponse(res, 'error', 'User not found', null, 404);
        }

        await user.destroy();
        return successResponse(res, 'success', 'User deleted successfully', null, 200);
    } catch (error) {
        return errorResponse(res, 'error', 'Failed to delete user', error, 500);
    }
}