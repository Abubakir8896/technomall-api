import { registerAs } from '@nestjs/config';

declare interface JWTConfigOptions {
  accessKey: string;
  refreshKey: string;
}

export const jwtConfig = registerAs<JWTConfigOptions>(
  'jwt',
  (): JWTConfigOptions => ({
    accessKey: process.env.JWT_ACCESS_KEY,
    refreshKey: process.env.REFRESH_KEY,
  }),
);