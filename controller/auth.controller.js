const db = require("../config/db");
const jwt = require("../config/jwt");
const crypto = require('crypto');
const generateOTP = require('../utils/otp.generator')
const { sendEmail } = require('../config/nodemailer')

class AuthController {
    async registration(req, res) {
        const { first_name, last_name, email, password, login } = req.body.data;  
        let errors = [];

        if (!first_name || first_name.length === 0) {
            errors.push({
                "field": "firstName",
                "message": "Укажите ваше имя"
            })
        }
        if (!last_name || last_name.length === 0) {
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
            const checkLogin = await db.query(`SELECT * FROM users WHERE login = $1`, [login]);
            if (checkLogin.rowCount > 0) {
                return res.status(409).json({error: "Пользователь с таким логином уже зарегистрирован на портале"})
            }
            const checkEmail = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);
            if (checkEmail.rowCount > 0) {
                return res.status(409).json({error: "Пользователь с такой электронной почтой уже зарегистрирован на портале"})
            }

            const hashedPassword = crypto.createHash('md5').update(password).digest('hex')
            const createUser = await db.query(`
                    INSERT INTO users (first_name, last_name, email, password, login) VALUES ($1, $2, $3, $4, $5) RETURNING id
                `, [first_name, last_name, email, hashedPassword, login]);
            const token = await jwt.generateToken({
                userId: createUser.rows[0].id,
            })
            return res.status(201).json({
                "status": "success",
                "message": "Registration successful",
                "accessToken": token,
                "user": {
                    "id": createUser.rows[0].id,
                    "first_name": first_name,
                    "last_name": last_name,
                    "email": email,
                    "login": login, 
                }
            })
        } 
        catch (e) {
            res.status(500).json({error: e.message});
        }
    }

    async login(req, res) {
        const { email, password } = req.body.data;  
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
                const { id, first_name, last_name, login, is_verified, email } = user.rows[0];
                if (!is_verified) {
                    return res.status(403).json({
                        "status": "failure",
                        "message": "Email не подтвержден",
                        "user": {
                            "email": email,
                        }
                    })
                }
                return res.status(200).json({
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
                res.status(401).json({"status": 'failure', "message": "Неправильный логин/пароль"});
            }
        }
        catch (e) {
            res.status(500).json({error: e.message});
        }
    }

    async resendOtp(req, res) {
        const {email} = req.body;
        const otp_code = generateOTP()
        const otp_expiration = new Date(Date.now() + 10 * 60 * 1000);
        const subject = 'Подтверждение Email'
        const message = `Ваш код подтверждения: ${otp_code}`
        sendEmail(email, subject, message)
        try {
            await db.query(`UPDATE users SET otp_code = $1, otp_expiration = $2 WHERE email = $3`, [otp_code, otp_expiration, email])
            return res.status(200).json({
                "status": "success",
                "message": `Код подтверждения отправлен на ваш адрес электронной почты: ${email}`,
            })
        } catch (e) {
            res.status(500).json({error: e.message});
        }
    }

    async verifyEmail(req, res) {
        const { email, otp, is_main_confirm } = req.body; 
        try {
            const query = await db.query(`SELECT * FROM users WHERE email = $1`, [email])
            const user = query.rows[0];
          
            const OTPExpired = new Date() > new Date(user.otp_expiration) 
            if (OTPExpired) return res.status(400).json({status: "error", message: "Срок действия кода подтверждения истек"});

            const alreadyVerified = user.is_verified === true && is_main_confirm;
            if (alreadyVerified) return res.status(400).json({status: "error", message: "Электронная почта пользователя уже подтверждена"});

            const isOtpRight = otp === user.otp_code;
            if (!isOtpRight) {
                return res.status(400).json({status: "error", message: "Неправильный код подтверждения"})
            }
            if (is_main_confirm) {
                await db.query(`UPDATE users SET is_verified = $1 WHERE email = $2`, [true, email])
            }

                res.status(200).json({status: "successful", message: "Аккаунт подтвержден"})
        } catch (e) {
            res.status(500).json({error: e.message});
        }
    }

    async checkEmail(req, res) {
        const {email} = req.body;
        try {
            const query = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);
            if (query.rowCount > 0) {
                if (!query.rows[0].is_verified) {
                    return res.status(401).json({
                        "status": "failure",
                        "message": `Электронная почта пользователя не подтверждена`,
                    })  
                }
                return res.status(200).json({
                    "status": "success",
                    "message": `Пользователь с такой почтой найден`,
                })
            }
            else {
                res.status(404).json({message: "Пользователь с такой электронной почтой не найден"});
            }
        } catch (e) {
            res.status(500).json({error: e.message});
        }
    }


    async resetPassword(req, res) {
        const {email, password} = req.body;
        try {
            const hashedPassword = crypto.createHash('md5').update(password).digest('hex')
            const query = await db.query(`UPDATE users SET password=$1 WHERE email=$2`, [hashedPassword, email]);
            if (query.rowCount > 0) {
                return res.status(200).json({
                    "status": "success",
                    "message": `Пароль успешно изменен`,
                })
            }
            else {
                res.status(404).json({message: "Пользователь с такой электронной почтой не найден"});
            }
        } catch (e) {
            res.status(500).json({error: e.message});
        }
    }
    
} 

module.exports = new AuthController();