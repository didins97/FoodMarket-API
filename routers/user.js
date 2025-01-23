const role = require('../middlewares/role');
const router = require('express').Router();
const userController = require('../controllers/usercontroller');
const auth = require('../middlewares/auth');
const {validateUserCreate, validateUserUpdate} = require('../validators/userValidator');

module.exports = app => {
    const authRoleMiddleware = [auth, role];

    router.get('/', authRoleMiddleware, userController.getUsers);
    router.get('/:id', authRoleMiddleware, userController.getUserById);
    router.post('/', authRoleMiddleware, validateUserCreate, userController.createUser);
    router.put('/:id', authRoleMiddleware, validateUserUpdate, userController.updateUser);
    router.delete('/:id', authRoleMiddleware, userController.deleteUser);

    app.use('/api/users', router);
}