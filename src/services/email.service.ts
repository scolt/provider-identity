import { createTransport } from 'nodemailer';
import config from '../config/config';
import mailer from 'nodemailer/lib/mailer';

export class EmailService {
    private transporter: mailer;

    constructor() {
        this.transporter = createTransport({
            service: 'gmail',
            auth: config.mailer.auth,
        });
    }

    sendCode(email: string, code: string): Promise<any> {
        return new Promise((resolve, reject) => this.transporter.sendMail({
            from: config.mailer.auth.user,
            subject: 'Registration code',
            to: email,
            text: `Your registration code is ${code}`,
        },                                                                (error) => {
            if (error) {
                console.log(error);
                reject(error);
            } else {
                resolve('ok');
            }
        }));
    }
}
