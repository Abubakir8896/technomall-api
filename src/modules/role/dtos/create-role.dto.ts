import { IsEnum, IsString, IsUUID } from "class-validator";
import { CreateRoleRequest } from "../interfaces";
import { ApiProperty } from "@nestjs/swagger";
import { $Enums, Role_Type } from '@prisma/client';

export class CreateRoleDto implements CreateRoleRequest {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsUUID(4, {
    each: true,
  })
  permissions: string[];

  @ApiProperty({
    examples: ['super_admin', 'user', 'admin'],
    enum: Role_Type,
    required: true
  })
  @IsEnum(Role_Type)
  @IsString()
  role: $Enums.Role_Type;
}