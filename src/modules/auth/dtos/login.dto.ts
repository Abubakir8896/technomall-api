import { IsOptional, IsString, IsUUID } from 'class-validator';
import { LoginRequest } from '../interfaces';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class LoginDto implements LoginRequest {
  @Transform(({value}) => {
    if(!value) return undefined
    else return value
  })
  @ApiProperty()
  @IsString()
  @IsOptional()
  ip?: string;

  @ApiProperty()
  @IsString()
  smsCode: string;

  @Transform(({value}) => {
    if(!value) return undefined
    else return value
  })
  @ApiProperty()
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  app_id?: string;

  @ApiProperty()
  @IsUUID(4)
  smsId: string;
}