const jwt = require('jsonwebtoken');

function checkAuth(req, res, next) {
    try {
        const token = req.headers.authorization
        const decodedToken = jwt.verify(token, "TestDompetKilat");
        req.userData = decodedToken;
        console.log(decodedToken);
        next();
    } catch (e) {
        return res.status(401).json({
            'message': "Invalid or expired token provided!",
            'error': e
        })
    }
}

module.exports = {
    checkAuth: checkAuth
}