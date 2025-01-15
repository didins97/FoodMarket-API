module.exports = app => {
    const router = require('express').Router();
    const authController = require('../controllers/authcontroller');

    router.post('/register', authController.register);
    router.post('/login', authController.login);
    app.use('/auth', router);
}