import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreatePermissionInterface } from '../interfaces';

export class CreatePermissionDto implements CreatePermissionInterface {
  @ApiProperty({
    example: 'value',
    required: true,
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'c5d4a6b7-76fc-43d9-98e2-3814765902d8',
    required: true,
  })
  @IsString()
  model_id: string;

  
  @ApiProperty()
  @IsString()
  code: string;
}
