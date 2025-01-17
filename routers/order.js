const router = require('express').Router();
const orderController = require('../controllers/ordercontroller');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

module.exports = app => {
    router.get('/orders', auth, orderController.getOrders);
    router.get('/orders/:id', auth, orderController.getOrderById);
    router.post('/orders', auth, orderController.createOrder);
    router.put('/orders/:id', [auth, role], orderController.updateStatusOrder);
    router.delete('/orders/:id', [auth, role], orderController.deleteOrder);

    app.use('/', router);
}