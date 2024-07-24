import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ConflictException,
    BadRequestException,
    UnprocessableEntityException,
    NotAcceptableException,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { CHECK_AUTH_KEY } from '../decorators';
  import { Observable } from 'rxjs';
  import { ConfigService } from '@nestjs/config';
  import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
  
  @Injectable()
  export class AuthGuard implements CanActivate {
    constructor(
      private reflector: Reflector,
      private config: ConfigService,
      private jwt: JwtService,
    ) {}
    canActivate(
      context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
      const isAuth = this.reflector.getAllAndOverride<string>(CHECK_AUTH_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
  
      if (!isAuth) {
        return true;
      }    
      
      const request = context.switchToHttp().getRequest<any>();
  
      const token = request.headers.authorization;
  
      if (!token || !token.startsWith('Bearer ')) {
        throw new UnprocessableEntityException('Please provide a Bearer token');
      }
  
      const accessToken = token.replace('Bearer ', '');
  
      if (!accessToken) {
        throw new ConflictException('Please provide a bearer token');
      }
      try {
        const data = this.jwt.verify(accessToken, {
          secret: this.config.getOrThrow<string>('jwt.accessKey'),
        });
        request.userId = data.id
        return true;
      } catch (err) {
        if (err instanceof TokenExpiredError) {
          throw new NotAcceptableException('Token already expired')
        }
  
        if (err instanceof JsonWebTokenError) {
          throw new BadRequestException('JWT error occurred');
        }
  
        throw new ConflictException('Token error');
      }
  
      return false;
    }
  }