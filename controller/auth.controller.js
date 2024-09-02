const db = require("../config/db");
const jwt = require("../config/jwt");
const crypto = require('crypto');

class AuthController {
    async registration(req, res) {
        const { first_name, last_name, email, password, login } = req.body;  
        let errors = [];

        if (!firstName || firstName.length === 0) {
            errors.push({
                "field": "firstName",
                "message": "Укажите ваше имя"
            })
        }
        if (!lastName || lastName.length === 0) {
            errors.push({
                "field": "lastName",
                "message": "Укажите вашу фамилию"
            })
        }
        if (!login || login.length === 0) {
            errors.push({
                "field": "login",
                "message": "Укажите логин"
            })
        }
        if (!password || password.length === 0) {
            errors.push({
                "field": "password",
                "message": "Укажите пароль"
            })
        }
        if (!email || email.length === 0 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push({
                "field": "email",
                "message": "Это не похоже на адрес электронной почты..."
            })
        }

        if (errors.length > 0) {
            return res.status(422).json({
                "errors": errors
            })
        }
        try {
            let hashedPassword = crypto.createHash('md5').update(password).digest('hex')
            const createUser = await db.query(`
                    INSERT INTO users (first_name, last_name, email, password, login) VALUES ($1, $2, $3, $4, $5) RETURNING id
                `, [first_name, last_name, email, hashedPassword, login]);
            const token = await jwt.generateToken({
                userId: createUser.rows[0].id,
            })
            return res.status(201).json({
                "status": "success",
                "message": "Registration successful",
                "data": {
                    "accessToken": token,
                    "user": {
                        "id": createUser.rows[0].id,
                        "first_name": first_name,
                        "last_name": last_name,
                        "email": email,
                        "login": login, 
                    }
                }
            })
        } 
        catch (e) {
            res.status(500).json({error: e.message});
        }
    }
    async login(req, res) {
        const { email, password } = req.body;  
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || password.length === 0) {
            return res.status(401).json({
                "status": "Bad request",
                "message": "Authentication failed",
                "statusCode": 401
            })
        }
        try {
            let hashedPassword = crypto.createHash('md5').update(password).digest('hex')
            const user = await db.query(`SELECT * FROM users WHERE email = $1 and password = $2`, [email, hashedPassword]);
            if (user.rowCount > 0) {
                const { id, first_name, last_name, login } = user.rows[0];
                return res.status(201).json({
                    "status": "success",
                    "message": "Login successful",
                    "user": {
                        "id": id,
                        "first_name": first_name,
                        "last_name": last_name,
                        "email": email,
                        "login": login, 
                    }
                })
            }
            else {
                res.status(404).json({error: "Пользователь с такими данными не найден"});
            }
        }
        catch (e) {
            res.status(500).json({error: e.message});
        }
    }
} 

module.exports = new AuthController();