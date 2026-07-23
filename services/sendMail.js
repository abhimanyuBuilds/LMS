import User from "../models/user.model.js"
import dotenv from "dotenv";
dotenv.config({});
import Mailgen from "mailgen"
import nodemailer from "nodemailer"


export const sendEmail = async (options) => {
    const mailgenGenerator = new Mailgen({
        theme: 'default',
        product: {
            name: "Learning Assignment Management System",
            link: 'http://Learning-AMS.com'
        }
    })
    const emailTextual = mailgenGenerator.generatePlaintext(options.mailgenContent);
    const emailHTML = mailgenGenerator.generate(options.mailgenContent);

    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        auth: {
            user: process.env.MAILTRAP_SMTP_USERNAME,
            pass: process.env.MAILTRAP_SMTP_PASSWORD,
        },
    });


    const mail = {
        from: process.env.MAILTRAP_SENDER_EMAIL || "LearningAMS@gmail.com",
        to: options.email,
        subject: options.subject,
        text: emailTextual,
        html: emailHTML
    };


    try {
        await transporter.sendMail(mail)
        console.log("Mail sent successfully..")
    } catch (error) {
        console.log("Email service failed. Make sure that you have provided your mailTrap credientials correct")
        console.error("Error", error)
    }
};

export const emailVerificationMailgenContent = (userName, verificationUrl) => {
    return {
        body: {
            name: userName,
            intro: `Welcome ${userName} We\'re very excited to have you on board.`,
            action: {
                instructions: 'To verify your email, please click here:',
                button: {
                    color: '#2253bc', // Optional action button color
                    text: 'Confirm your account',
                    link: verificationUrl
                }
            },
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        },
    }
};


export const forgotPasswordMailgenContent = (userName, passwordResetUrl) => {
    return {
        body: {
            name: userName,
            intro: [`Hi ${userName},`, "We received a request to reset the password for your account.",
            "If you made this request, click the button below to set a new password.",
            "If you did not request a password reset, you can safely ignore this email."],
            action: {
        instructions: 'Click the button below to reset your password. This link will expire in 10 minutes.',
            button: {
            color: '#2253bc', // Optional action button color
                text: 'Reset Password',
                    link: passwordResetUrl
        }
    },
    outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
},
    }
};


