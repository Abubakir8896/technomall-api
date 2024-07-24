import { IsArray, IsEnum, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UpdateProductRequest, UpdatePropertiesOnProductInterface } from '../interfaces';
import { Transform } from 'class-transformer';

enum status {
  active = 'active',
  inactive = 'inactive',
}

export class UpdateProductDto implements Omit<UpdateProductRequest, 'id'> {
  @ApiProperty({
    example: '{ "uz": "salom", "en": "salom"}',
    required: false,
  })
  @IsOptional()
  @IsObject()
  title?: object;

  @ApiProperty({
    example: '{ "uz": "salom", "en": "salom"}',
    required: false,
  })
  @IsOptional()
  @IsObject()
  description?: object;

  @ApiProperty({
    example: '[660d5290e49538271705501e, value: {"uz":"Salom", "en":"Hello"}',
    required: true,
  })
  @IsOptional()
  properties?: UpdatePropertiesOnProductInterface;

  @ApiProperty({
    example: '10000',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({
    example: '100',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  count?: number;

  @ApiProperty({
    examples: ['active', 'inactive'],
    required: false,
  })
  @IsOptional()
  @IsEnum(status)
  @IsString()
  status!: 'active' | 'inactive';
}
