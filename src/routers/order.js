const router = require('express').Router();
const orderController = require('../controllers/ordercontroller');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

module.exports = app => {
    router.get('/', auth, orderController.getOrders);
    router.get('/:id', auth, orderController.getOrderById);
    router.post('/', auth, orderController.createOrder);
    router.put('/:id', [auth, role], orderController.updateStatusOrder);
    router.delete('/:id', [auth, role], orderController.deleteOrder);

    app.use('/api/orders', router);
}