const router = require('express').Router();
const foodController = require('../controllers/foodcontroller');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');
const { validateFoodCreate, validateFoodUpdate } = require('../validators/foodValidator');

module.exports = app => {
    router.get('/', auth, foodController.getFoods);
    router.get('/:id', auth, foodController.getFoodById);

    router.post('/', [auth, role], validateFoodCreate, foodController.createFood);
    router.put('/:id', [auth, role], validateFoodUpdate, foodController.updateFood);
    router.delete('/:id', [auth, role], foodController.deleteFood);

    app.use('/api/foods', router);    
}