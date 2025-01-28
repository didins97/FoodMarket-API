const { body, validationResult } = require('express-validator');
const { errorResponse } = require('../helpers/response');

const validateOrderCreate = [
    body('payment_method').isIn(['cash', 'transfer']).withMessage('Payment method must be cash or transfer'),
    body('order_data').isArray().withMessage('Order data must be an array')
        .custom(orderData => {
            if (orderData.length === 0) {
                throw new Error('Order data must not be empty');
            }

            orderData.forEach(item => {
                if (!item.food_id || !item.price || !item.qty) {
                    throw new Error('Each order item must have food_id, price, and qty');
                }
            });

            return true;
        }),


    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return errorResponse(res, 'error', 'Validation error', errors.array(), 400);
        }
        next();
    }
];

module.exports = {
    validateOrderCreate
}
