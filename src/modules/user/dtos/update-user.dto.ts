import { IsString, IsArray, IsPhoneNumber, IsNotEmpty, IsEmail, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UpdateUserInterface } from '../interfaces';
import { $Enums, Role, Role_Type } from '@prisma/client';
import { Transform } from 'class-transformer';

export class UpdateUserDto implements Omit<UpdateUserInterface, 'id'> {
  @ApiProperty({
    example: 'John',
    required: false,
  })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiProperty({
    example: 'Doe',
    required: false,
  })
  @IsString()
  @IsOptional()
  last_name?: string;

  @ApiProperty({
    example: 'Tashkent, Uzbekistan',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    example: 'qwerty123',
    required: false,
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({
    example: '+998977777777',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsPhoneNumber("UZ")
  phone: string;

  @ApiProperty({
    example: 'JohnDoe77@gmail.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    maxItems: 8,
    format: 'binary',
    type: 'string',
    required:false
  })
  image: any;

  @ApiProperty({
    examples: ['super_admin', 'user', 'admin'],
    enum: Role_Type,
    required: false
  })
  @IsOptional()
  @IsEnum(Role_Type)
  @IsString()
  role: $Enums.Role_Type;

  @Transform(({ value }) => {
    if (!value) return undefined;
    else return value
  })
  @ApiProperty({required:false})
  @IsOptional()
  @IsUUID(4, {
    each: true,
  })
  roles?: string[];
}
