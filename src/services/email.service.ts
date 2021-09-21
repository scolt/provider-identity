import { createTransport } from 'nodemailer';
import mailer from 'nodemailer/lib/mailer';

import { config } from '../config';

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
                reject(error);
            } else {
                resolve('ok');
            }
        }));
    }
}
