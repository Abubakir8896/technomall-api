import { IsString, IsArray, IsPhoneNumber, IsNotEmpty, IsEmail, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateUserInterface } from '../interfaces';
import { $Enums, Role, Role_Type } from '@prisma/client';

export class CreateUserDto implements CreateUserInterface {
  @ApiProperty({
    example: 'John',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({
    example: 'Doe',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({
    example: 'Tashkent, Uzbekistan',
    required: true,
  })
  @IsOptional()
  @IsString()
  address: string;

  @ApiProperty({
    example: 'qwerty123',
    required: false,
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({
    example: '+998977777777',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber("UZ")
  phone: string;

  @ApiProperty({
    example: 'JohnDoe77@gmail.com',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    maxItems: 8,
    format: 'binary',
    type: 'string',
    required: false
  })
  @IsOptional()
  image?: any;

  @ApiProperty({
    examples: ['super_admin', 'user', 'admin'],
    enum: Role_Type,
    required: true
  })
  @IsEnum(Role_Type)
  @IsString()
  role: $Enums.Role_Type;

  @ApiProperty({
    example: '["660d5290e49538271705501e"]',
    required: true,
  })
  roles: string[];
}
