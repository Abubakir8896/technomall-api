import { User } from "@prisma/client";

export declare interface LoginGetSMSCodeRequest {
  email: string;
}

export declare interface LoginGetSMSCodeResponse {
  smsId: string;
  expireTime: number;
  smsCode: string;
}

export declare interface LoginRequest {
  smsCode: string;
  userAgent?: string;
  app_id?: string
  ip?: string;
  smsId: string;
}

export declare interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export declare interface LoginForAdminRequest {
  phone: string;
  password: string;
  userAgent?: string;
  app_id?: string
  ip?: string;
}

export declare interface LoginForAdminResponse {
  accessToken: string;
  refreshToken: string;
}