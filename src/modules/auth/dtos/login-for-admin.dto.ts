import { IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from 'class-validator';
import { LoginForAdminRequest } from '../interfaces';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class LoginForAdminDto implements LoginForAdminRequest {
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
  password: string;

  @Transform(({value}) => {
    if(!value) return undefined
    else return value
  })
  @ApiProperty()
  @IsString()
  @IsOptional()
  userAgent?: string;

  @ApiProperty()
  @IsPhoneNumber("UZ")
  @IsNotEmpty()
  phone: string;
}