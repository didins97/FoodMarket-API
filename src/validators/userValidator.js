const { body, validationResult } = require('express-validator');
const { errorResponse } = require('../helpers/response');

const User = require('../models/user');

const validateUserCreate = [
    // Validasi data
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Email is invalid'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('role').isIn(['admin', 'user']).withMessage('Role must be admin or user'),

    // Validasi hasil validasi
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return errorResponse(res, 'error', 'Validation error', errors.array(), 400);
        }
        next();
    }
]

const validateUserUpdate = [
    // Validasi data
    body('name').optional().notEmpty().withMessage('Name is required'),
    body('email').optional().isEmail().withMessage('Email is invalid'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('role').optional().isIn(['admin', 'user']).withMessage('Role must be admin or user'),
    body('phone').optional().isMobilePhone('id-ID').withMessage('Phone number is invalid'),
    body('address').optional().notEmpty().withMessage('Address is required'),
    body('city').optional().notEmpty().withMessage('City is required'),
    body('country').optional().notEmpty().withMessage('Country is required'),

    // Validasi hasil validasi
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return errorResponse(res, 'error', 'Validation error', errors.array(), 400);
        }
        next();
    }
]

module.exports = {
    validateUserCreate,
    validateUserUpdate
}
