import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer/dist';
import { User } from '@prisma/client';
import * as fs from 'fs'
import { join } from 'path';
@Injectable()
export class MailService {
    constructor(private mailerService: MailerService){}

    async sendCustomerConfirmation(customer: User, sms: string):Promise<void>{
        const confirmation = fs.readFileSync(join(process.cwd(), "src", "modules", "mail", "templates", "confirmation.hbs"))
        await this.mailerService.sendMail({
        to:customer.email,
        subject: `Welcome to Online Magazine ?`,
        template: confirmation.toString(),
        context: {
        name: customer.first_name,
        sms,
        }})}
}