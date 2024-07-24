import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { PrismaService } from "../../prisma/prisma.service";
import { AuthService } from "./auth.service";
import { JwtService } from "@nestjs/jwt";
import { MailService } from "../mail/mail.service";
import { MailerService } from "@nestjs-modules/mailer";
import { MailModule } from "../mail/mail.module";

@Module({
  imports:[MailModule],
  controllers: [AuthController],
  providers: [JwtService, PrismaService, AuthService, MailService]
})
export class AuthModule {}