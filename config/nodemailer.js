const nodemailer = require('nodemailer')
require('dotenv').config()

function sendEmail(email, subject, message, name, otp_code) {
    const html = `<div style="display: flex; flex-direction: column; align-items: center; font-family: Arial">
    <div style="background-color: #000; height: 80px; width: 80%; padding: 24px 30px 40px; color: #fff; border-radius: 20px 20px 0 0">
         <div style="height: 100%; display: flex; flex-direction: column">
    <h2>Pictura</h1>
    <h1 style="margin-top: -3px">${name}, твой одноразовый код подтверждения</h1>
        </div>
        </div> 
        <div style="height: 80px; border-left: 1px solid #000; border-right: 1px solid #000; width: 80%; padding: 24px 29px 40px">
    <div style="height: 100%; display: flex; flex-direction: column; align-items: center">
        <h1>${otp_code}</h1>
    <span style="color: gray">Код действителен в течение ограниченного времени</span>
    </div>
        </div> 
        <div style="background-color: #000; height: 80px; width: 80%; padding: 24px 30px 40px; color: #fff; border-radius: 0 0 20px 20px">
    <div style="height: 100%; display: flex; flex-direction: column">
    <h2>Нужна помощь?</h2>
    <span>Свяжитесь со службой поддержки в Telegram @egorrr_shv, или просто ответьте на это письмо, чтобы получить помощь.</span>
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