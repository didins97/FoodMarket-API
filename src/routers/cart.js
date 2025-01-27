const router = require('express').Router();
const cartController = require('../controllers/cartcontroller');
const auth = require('../middlewares/auth');

module.exports = app => {
    router.get('/carts', auth, cartController.getCarts);
    router.get('/carts/:id', auth, cartController.getCartById);
    router.post('/carts', auth, cartController.createCart);
    router.patch('/carts/:id', auth, cartController.updateQtyCart);
    router.delete('/carts/:id', auth, cartController.deleteCart);

    app.use('/', router);
}
    
