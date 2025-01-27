const { body, validationResult } = require('express-validator');
const { errorResponse } = require('../helpers/response');

const validateFoodCreate = [
    // Validasi data
    body('name').notEmpty().withMessage('Name is required'),
    body('price').notEmpty().withMessage('Price is required'),
    body('stock').notEmpty().withMessage('Stock is required'),
    body('image').notEmpty().withMessage('Image is required'),
    body('category_id').notEmpty().withMessage('Category is required'),

    // Validasi hasil validasi
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return errorResponse(res, 'error', 'Validation error', errors.array(), 400);
        }
        next();
    }
]

const validateFoodUpdate = [
    body('name').optional().notEmpty().withMessage('Name is required'),
    body('price').optional().notEmpty().withMessage('Price is required'),
    body('stock').optional().notEmpty().withMessage('Stock is required'),
    body('image').optional().notEmpty().withMessage('Image is required'),
    body('category_id').optional().notEmpty().withMessage('Category is required'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return errorResponse(res, 'error', 'Validation error', errors.array(), 400);
        }
        next();
    }
]

module.exports = {
    validateFoodCreate,
    validateFoodUpdate
}
