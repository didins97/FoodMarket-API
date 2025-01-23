module.exports = (req, res, next) => {
    // console.log(req.userData.data.role);
    if (req.userData.data.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    next();
}