const role = require('../middlewares/role');
const router = require('express').Router();
const userController = require('../controllers/usercontroller');
const auth = require('../middlewares/auth');

module.exports = app => {
    const authRoleMiddleware = [auth, role];

    router.get('/users', authRoleMiddleware, userController.getUsers);
    router.get('/users/:id', authRoleMiddleware, userController.getUserById);
    router.post('/users', authRoleMiddleware, userController.createUser);
    router.put('/users/:id', authRoleMiddleware, userController.updateUser);
    router.delete('/users/:id', authRoleMiddleware, userController.deleteUser);

    app.use('/', router);
}