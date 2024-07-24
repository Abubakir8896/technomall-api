import { IsOptional, IsString } from 'class-validator';
import { RefreshRequest } from '../interfaces';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class RefreshDto implements Omit<RefreshRequest, "refreshToken"> {
  @Transform(({value}) => {
    if(!value) return undefined
    else return value
  })
  @ApiProperty()
  @IsString()
  @IsOptional()
  ip?: string;

  @Transform(({value}) => {
    if(!value) return undefined
    else return value
  })
  @ApiProperty()
  @IsString()
  @IsOptional()
  userAgent?: string;
}