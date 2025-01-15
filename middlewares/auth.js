const jsonwebtoken = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jsonwebtoken.verify(token, 'secret-key');
        req.userData = decoded;
        // console.log(req.userData.data); // id user
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Auth failed'
        })
    }
}