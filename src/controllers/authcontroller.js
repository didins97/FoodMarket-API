const db = require('../models');
const response = require('../helpers/response');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = db.User;

exports.register = async (req, res) => {
    const { name, email, password, confirmPassword, role, phone, address, city, country } = req.body;
    try {
        checkUser = await User.findOne({ where: { email } });
        if (checkUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword, role, phone, address, city, country });

        // hash token
        const token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + (60 * 60),
            id: user.id,
            role: user.role
        }, 'secret-key');

        response.successResponse(res, 'success', 'User registered successfully', user, 201, token);
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            return
        }

    }
}

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid password' });
        }

        // hash token
        const token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + (60 * 60),
            id: user.id,
            role: user.role
        }, 'secret-key');

        response.successResponse(res, 'success', 'User logged in successfully', user, 200, token);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to login user' });
    }
}