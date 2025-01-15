const db = require('../models');
const response = require('../helpers/response');
const bcrypt = require('bcryptjs');

const User = db.User;

exports.getUsers = async (req, res) => {
    try {
        const users = await User.scope('withoutPassword').findAll();
        response.successResponse(res, 'success', 'Get all users successfully', users, 200);
    } catch (error) {
        console.error(error);
        response.errorResponse(res, 'error', 'Failed to get users', 500);
    }
}

exports.getUserById = async (req, res) => {
    // console.log(req.params.id);
    try {
        const user = await User.scope('withoutPassword').findByPk(req.params.id);
        response.successResponse(res, 'success', 'Get user by id successfully', user, 200);
    } catch (error) {
        console.error(error);
        response.errorResponse(res, 'error', 'Failed to get user by id', 500);
    }
}

exports.createUser = async (req, res) => {
    const { name, email, password, role, phone, address, city, country } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({ name, email, password: hashedPassword, role, phone, address, city, country });

        response.successResponse(res, 'success', 'User created successfully', user, 201);
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            response.errorResponse(res, 'error', 'Validation error', error.errors, 400);
        }

        response.errorResponse(res, 'error', 'Failed to create user', 500);
    }
}

exports.updateUser = async (req, res) => {
    const id = req.params.id;
    const { name, email, password, role, phone, address, city, country } = req.body;

    try {
        const user = await User.findByPk(id);
        if (!user) {
            return response.errorResponse(res, 'error', 'User not found', 404);
        }

        user.name = name ? name : user.name;
        user.email = email ? email : user.email;
        user.password = password ? await bcrypt.hash(password, 10) : user.password;
        user.role = role ? role : user.role;
        user.phone = phone ? phone : user.phone;
        user.address = address ? address : user.address;
        user.city = city ? city : user.city;
        user.country = country ? country : user.country;
        await user.save();

        response.successResponse(res, 'success', 'User updated successfully', user, 200);

    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            response.errorResponse(res, 'error', 'Validation error', error.errors, 400);
        }

        response.errorResponse(res, 'error', 'Failed to update user', 500);
    }
}

exports.deleteUser = async (req, res) => {
    const id = req.params.id;

    try {
        const user = await User.findByPk(id);
        if (!user) {
            return response.errorResponse(res, 'error', 'User not found', 404);
        }

        await user.destroy();
        response.successResponse(res, 'success', 'User deleted successfully', null, 200);
    } catch (error) {
        response.errorResponse(res, 'error', 'Failed to delete user', 500);
    }
}