import { createTransport } from 'nodemailer';
import config from '../config/config';
import mailer from 'nodemailer/lib/mailer';

export class EmailService {
    private transporter: Mail;

    constructor() {
        this.transporter = createTransport({
            service: 'gmail',
            auth: config.mailer.auth,
        });
    }

    sendCode(email: string, code: string): Promise<any> {
        return this.transporter.sendMail({
            subject: 'Registration code',
            to: email,
            text: `Your registration code is ${code}`,
        });
    }
}
