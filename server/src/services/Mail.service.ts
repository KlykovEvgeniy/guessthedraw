import nodemailer from 'nodemailer';
import { config } from 'dotenv';
config();

class MailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });
    }

    async sendActivationMail(
        to: string,
        username: string,
        activationToken: string,
    ) {
        const activationLink = `${process.env.API_URL}/api/v1.0.0/auth/activate/${activationToken}`;

        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: `Account activation for ${username}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2>Hello, ${username}!</h2>
                    <p>To complete your registration and submit your account, please verify your email address by clicking the link below:</p>
                    <div style="margin: 20px 0;">
                        <a href="${activationLink}" 
                           style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                           Verify Email
                        </a>
                    </div>
                    <p style="font-size: 12px; color: #666;">If the button doesn't work, copy and paste this link into your browser: <br> ${activationLink}</br></p>
                </div>
            `,
        });
    }

    async sendChangePasswordMail(
        to: string,
        username: string,
    ) {
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: `Accout ${username} password was changed`,
            html: `
             <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2>Hello, ${username}!</h2>
                    <p>Your password was changed</p>
                    <p style="font-size: 12px; color: #666;">If it wasnt you, please contact us: <br>guessthedraw@gmail.com</br></p>
                </div>
            `
        })
    }
}

export default new MailService();
