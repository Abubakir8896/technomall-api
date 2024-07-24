import { registerAs } from '@nestjs/config';

declare interface MinioConfigOptions {
  endPoint: string;
  accessKey: string;
  secretKey: string;
  useSSL: true;
}

export const minioConfig = registerAs(
  'minio',
  (): MinioConfigOptions => ({
    accessKey: process.env.ACCESS_KEY,
    secretKey: process.env.SECRET_KEY,
    endPoint: process.env.ENDPOINT,
    useSSL: true,
  }),
);
