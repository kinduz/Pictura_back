const nodemailer = require('nodemailer')
require('dotenv').config()

function sendEmail(email, subject, message, name, otp_code) {
    const html = `<div style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 10px;">
    <style>
        @media only screen and (max-width: 600px) {
            .container {
                width: 100% !important;
                padding: 10px !important;
            }
            .header, .body, .footer {
                padding: 20px !important;
            }
        }
    </style>
    <div class="container" style="width: 80%; margin: 0 auto; padding: 24px; box-sizing: border-box;">
        <div class="header" style="background-color: #000; padding: 24px 30px; color: #fff; border-radius: 20px 20px 0 0;">
            <h2 style="margin: 0;">Pictura</h2>
            <h1 style="margin-top: 10px;">${name}, твой одноразовый код подтверждения</h1>
        </div> 
        <div class="body" style="padding: 24px 30px; border: 1px solid #000; border-top: none;">
            <h1>${otp_code}</h1>
            <span style="color: gray;">Код действителен в течение ограниченного времени</span>
        </div> 
        <div class="footer" style="background-color: #000; padding: 24px 30px; color: #fff; border-radius: 0 0 20px 20px;">
            <h2>Нужна помощь?</h2>
            <span>Свяжитесь со службой поддержки в Telegram @egorrr_shv, или просто ответьте на это письмо, чтобы получить помощь.</span>
        </div>
    </div>
    </div>`

    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD,
        },
    })
    const mailOptions = {
        from: process.env.MAIL_USER,
        to: email,
        subject,
        html
    }

    transporter.sendMail(mailOptions)
}

module.exports = {sendEmail}