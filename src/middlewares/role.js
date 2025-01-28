module.exports = (req, res, next) => {
    // console.log(req.userData.role);
    if (req.userData.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    next();
}