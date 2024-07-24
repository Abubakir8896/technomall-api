import {
    Body,
    Controller,
    Headers,
    Post,
  } from '@nestjs/common';
  import { ApiTags } from '@nestjs/swagger';
  import { AuthService } from './auth.service';
  import { LoginDto, LoginForAdminDto, LoginGetSMSDto, RefreshDto } from './dtos';
  import {
    LoginForAdminResponse,
    LoginGetSMSCodeResponse,
    LoginResponse,
    RefreshResponse,
  } from './interfaces';
  
  @ApiTags('Auth')
  @Controller('auth')
  export class AuthController {
    #_service: AuthService;
  
    constructor(service: AuthService) {
      this.#_service = service;
    }
  
    @Post('/login')
    async login(@Body() payload: LoginDto): Promise<LoginResponse> {
      return await this.#_service.login(payload);
    }
  
    @Post('/login/sms')
    async loginSms(
      @Body() payload: LoginGetSMSDto,
    ): Promise<LoginGetSMSCodeResponse> {
      return await this.#_service.loginGetSms(payload);
    }
  
    @Post('/login/admin')
    async loginForAdmin(
      @Body() payload: LoginForAdminDto,
    ): Promise<LoginForAdminResponse> {
      return await this.#_service.loginForAdmin(payload);
    }
  
    @Post('/refresh')
    async refresh(@Headers('refreshToken') refreshToken: string, @Body() payload: RefreshDto): Promise<RefreshResponse> {
      return await this.#_service.refresh({refreshToken, ...payload});
    }
  
    // @Delete('/logout')
    // async logout(): Promise<void> {
    //   await this.#_service.logout();
    // }
  }