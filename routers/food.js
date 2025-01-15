const router = require('express').Router();
const foodController = require('../controllers/foodcontroller');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

module.exports = app => {
    router.get('/foods', auth, foodController.getFoods);
    router.get('/foods/:id', auth, foodController.getFoodById);

    router.post('/foods', [auth, role], foodController.createFood);
    router.put('/foods/:id', [auth, role], foodController.updateFood);
    router.delete('/foods/:id', [auth, role], foodController.deleteFood);

    app.use('/', router);    
}