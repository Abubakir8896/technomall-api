import {
    BadRequestException,
    ForbiddenException,
    HttpException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
    UnprocessableEntityException,
  } from '@nestjs/common';
  import { JwtService, TokenExpiredError } from '@nestjs/jwt';
  import { PrismaService } from '../../prisma/prisma.service';
  import {
    LoginForAdminRequest,
    LoginForAdminResponse,
    LoginGetSMSCodeRequest,
    LoginGetSMSCodeResponse,
    LoginRequest,
    LoginResponse,
    RefreshRequest,
    RefreshResponse,
    SendSMSRequest,
  } from './interfaces';
  import { ConfigService } from '@nestjs/config';
  import { isJWT } from 'class-validator';
  import { UAParser } from 'ua-parser-js';
  import * as bcrypt from 'bcrypt'
  import { JWT_ACCESS_EXPIRE_TIME, JWT_REFRESH_EXPIRE_TIME, SMS_EXPIRE_TIME } from '../../constants';
import { MailService } from '../mail/mail.service';
  
  @Injectable()
  export class AuthService {
    #_prisma: PrismaService;
    #_jwt: JwtService;
    #_config: ConfigService;
    #_mail: MailService;
  
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService, mail: MailService) {
      this.#_prisma = prisma;
      this.#_jwt = jwt;
      this.#_config = config;
      this.#_mail = mail;
    }
  
    async loginGetSms(
        payload: LoginGetSMSCodeRequest,
      ): Promise<LoginGetSMSCodeResponse> {
        const foundedUser = await this.#_prisma.user.findFirst({
          where: { email: payload.email },
        });
    
        let userId = '';
    
        if (foundedUser) {
          userId = foundedUser.id;
        }
    
        if (!foundedUser) {
          const newUser = await this.#_prisma.user.create({
            data: { phone: payload.email },
          });
          userId = newUser.id;
        }
    
        const smsCode = String(Math.floor(Math.random() * 90000) + 10000);
    
        await this.#_mail.sendCustomerConfirmation(foundedUser, smsCode);
        
        const time = Number(Number(process.env.SMS_EXPIRE_TIME)*1000)
        const expireSmsTime = String(new Date().getTime() + time);
        
        let newSms:any = {}

        const foundedSms = await this.#_prisma.sms.findFirst({where:{userId:userId}})

        if(foundedSms){
            newSms = await this.#_prisma.sms.update({
                where: {id: foundedSms.id},
                data: {
                  smsCode: smsCode,
                  smsExpireTime: expireSmsTime,
                },
              });
        }else{
            newSms = await this.#_prisma.sms.create({data:{
                userId:userId,
                smsCode: smsCode,
                smsExpireTime: expireSmsTime
            }})
        }        

        return {
          expireTime: SMS_EXPIRE_TIME,
          smsId: newSms.id,
          smsCode,
        };
      }
  
    async login(payload: LoginRequest): Promise<LoginResponse> {
      const foundedSms = await this.#_prisma.sms.findFirst({
        where: { id: payload.smsId, smsCode:payload.smsCode },
      });
  
      let app_id = ''

      if(payload.app_id){
        app_id = payload.app_id
      }

      if (!foundedSms) {
        throw new NotFoundException('User not found');
      }
  
      const user = await this.#_prisma.user.findFirst({where:{id:foundedSms.userId}})

      const currentTime = new Date().getTime(); 
           

      if (Number(foundedSms.smsExpireTime) - currentTime < 0) {
        throw new UnprocessableEntityException('Sms Code already expired');
      }
  
      let parser = new UAParser(payload.userAgent);
      console.log(parser.getDevice().model);
      


      const foundedUserDevice = await this.#_prisma.userDevice.findFirst({
        where: {
          userId: foundedSms.userId,
          name: parser.getBrowser().name,
          model: parser.getDevice().model,
          version: parser.getBrowser().name,
          ip: payload.ip,
        },
      });
  
      const accessToken = this.#_jwt.sign(
        { id: user.id, role_type: user.role_type },
        {
          secret: this.#_config.getOrThrow<string>('jwt.accessKey'),
          expiresIn: JWT_ACCESS_EXPIRE_TIME,
        },
      );
      const refreshToken = this.#_jwt.sign(
        { id: foundedSms.id },
        {
          secret: this.#_config.getOrThrow<string>('jwt.refreshKey'),
          expiresIn: JWT_REFRESH_EXPIRE_TIME,
        },
      );
  
      if (foundedUserDevice) {
        await this.#_prisma.userDevice.update({
          where: { id: foundedUserDevice.id },
          data: {
            accessToken,
            refreshToken,
          },
        });
  
        return {
          accessToken,
          refreshToken,
        };
      }
  
      await this.#_prisma.userDevice.create({
        data: {
          accessToken,
          refreshToken,
          userId: foundedSms.userId,
          app_id: app_id,
          name:parser.getBrowser().name,
          model: parser.getDevice().model,
          version: parser.getBrowser().version,
          ip: payload.ip,
        },
      });
  
      return {
        accessToken,
        refreshToken,
      };
    }
  
    async loginForAdmin(
      payload: LoginForAdminRequest,
    ): Promise<LoginForAdminResponse> {
      const foundedUser = await this.#_prisma.user.findFirst({
        where: { phone: payload.phone },
      });
      if (!foundedUser) {
        throw new NotFoundException('User not found');
      }
      const is_Match = await bcrypt.compare(payload.password,foundedUser.password)

      if(!is_Match){
            throw new UnauthorizedException("Password incorrect")
      }
  
      let parser = new UAParser(payload.userAgent);

      let app_id = ''

      if(payload.app_id){
        app_id = payload.app_id
      }


      const foundedUserDevice = await this.#_prisma.userDevice.findFirst({
        where: {
          userId: foundedUser.id,
          name: parser.getBrowser().name,
          model: parser.getDevice().model,
          version: parser.getBrowser().name,
          ip: payload.ip,
        },
      });
  
      const accessToken = this.#_jwt.sign(
        { id: foundedUser.id, role:foundedUser.role_type },
        {
          secret: this.#_config.getOrThrow<string>('jwt.accessKey'),
          expiresIn: JWT_ACCESS_EXPIRE_TIME,
        },
      );
      const refreshToken = this.#_jwt.sign(
        { id: foundedUser.id, role: foundedUser.role_type },
        {
          secret: this.#_config.getOrThrow<string>('jwt.refreshKey'),
          expiresIn: JWT_REFRESH_EXPIRE_TIME,
        },
      );
  
      if (foundedUserDevice) {
        await this.#_prisma.userDevice.update({
          where: { id: foundedUserDevice.id },
          data: {
            accessToken,
            refreshToken,
          },
        });
  
        return {
          accessToken,
          refreshToken,
        };
      }
  
      await this.#_prisma.userDevice.create({
        data: {
          accessToken,
          refreshToken,
          userId: foundedUser.id,
          app_id: app_id,
          name:parser.getBrowser().name,
          model: parser.getDevice().model,
          version: parser.getBrowser().version,
          ip: payload.ip,
        },
      });
  
      return {
        accessToken,
        refreshToken,
      };
    }
  
    async refresh(payload: RefreshRequest): Promise<RefreshResponse> {
      try {
        if (!isJWT(payload.refreshToken)) {
          throw new UnprocessableEntityException('Invalid token');
        }
  
        const data = await this.#_jwt.verifyAsync(payload.refreshToken, {
          secret: this.#_config.getOrThrow<string>('jwt.refreshKey'),
        });
  
        let parser = new UAParser(payload.userAgent);


        const userDevice = await this.#_prisma.userDevice.findFirst({
          where: {
            name: parser.getBrowser().name,
            model: parser.getDevice().model,
            version: parser.getBrowser().version,
            ip: payload.ip,
          },
        });                

        const accessToken = this.#_jwt.sign(
          { id: data.id },
          { secret: this.#_config.getOrThrow<string>('jwt.accessKey') },
        );
        const refreshToken = this.#_jwt.sign(
          { id: data.id },
          { secret: this.#_config.getOrThrow<string>('jwt.refreshKey') },
        );        
  
        await this.#_prisma.userDevice.update({
          where: { id: userDevice.id },
          data: {
            accessToken,
            refreshToken,
          },
        });
  
        return {
          accessToken,
          refreshToken,
        };
      } catch (err) {
        if (err instanceof TokenExpiredError) {
          throw new HttpException(err.message, 455);
        }
        throw new ForbiddenException('Refresh token error');
      }
    }
  
    async #_sendSms(payload: SendSMSRequest): Promise<any> {
      const myHeaders = new Headers();
      myHeaders.append(
        'Authorization',
        'App 53006856e580728eba1da7cd3f11ce58-3e9f8ccf-6c3b-426b-a398-cc89ba3b4a93',
      );
      myHeaders.append('Content-Type', 'application/json');
      myHeaders.append('Accept', 'application/json');
  
      const raw = JSON.stringify({
        messages: [
          {
            destinations: [{ to: `998${payload.phone}` }],
            from: 'ServiceSMS',
            text: `Assalomu alaykum, sizning dacha v gorax ga kirish kodingiz: ${payload.smsCode}`,
          },
        ],
      });
      let result = null;
  
      fetch('https://xlq3eg.api.infobip.com/sms/2/text/advanced', {
        method: 'POST',
        headers: myHeaders,
        body: raw,
      })
        .then((response) => response.text())
        .then((res) => (result = res))
        .catch((error) => console.log('error', error));
      return result;
    }
  }