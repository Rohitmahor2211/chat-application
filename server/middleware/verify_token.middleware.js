// middleware/verifyToken.js

const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization) {
            token = req.headers.authorization?.split(" ")[1];
        }

        if (!token && req.cookies?.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({
                message: "Token missing"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_secret);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Session expired. Please log in again." });
        }
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid session. Please log in again." });
        }
        return res.status(401).json({ message: "Authentication failed" });
    }
};

module.exports = verifyToken;