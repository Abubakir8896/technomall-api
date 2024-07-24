import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UpdatePermissionInterface } from '../interfaces';

export class UpdatePermissionDto implements Omit<UpdatePermissionInterface, 'id'>{
  @ApiProperty({
    example: 'value',
    required: false,
  })
  @IsOptional()
  @IsString()
  name: string;
}
