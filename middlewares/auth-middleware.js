const ApiError = require("../exceptions/api-error");
const { validateAccessToken } = require("../service/jwt.service");

module.exports = function (req, res, next) {
    try {
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
            return next(ApiError.UnauthoriedError());
        }

        const accessToken = authorizationHeader.split('')[1];
        if (!accessToken) {
            return next(ApiError.UnauthoriedError());
        }

        const userData = validateAccessToken(accessToken);
        if (!userData) {
            return next(ApiError.UnauthoriedError());
        }

        req.user = userData;
        next();
    } catch (e) {
        return next(ApiError.UnauthoriedError());
    }
}