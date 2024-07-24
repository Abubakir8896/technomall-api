import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { UpdateRoleRequest } from '../interfaces';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { $Enums, Role_Type } from '@prisma/client';

export class UpdateRoleDto implements Omit<UpdateRoleRequest, 'id'> {
  @Transform(({value}) => {
    if(!value) return undefined
    else return value
  })
  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;

  @Transform(({value}) => {
    if(!value) return undefined
    else return value
  })
  @ApiProperty()
  @IsUUID(4, {
    each: true,
  })
  @IsOptional()
  permissions?: string[];

  @ApiProperty({
    examples: ['super_admin', 'user', 'admin'],
    enum: Role_Type,
    required: true
  })
  @IsOptional()
  @IsEnum(Role_Type)
  @IsString()
  role: $Enums.Role_Type;
}