import { IsString, IsArray, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateProductInterface, CreatePropertiesOnProductInterface } from '../interfaces';
import { Transform } from 'class-transformer'

export class CreateProductDto implements CreateProductInterface {
  @ApiProperty({
    example: '{ "uz": "salom", "en": "salom"}',
    required: true,
  })
  title: object;

  @ApiProperty({
    example: '{ "uz": "salom", "en": "salom"}',
    required: true,
  })
  description: object;

  @ApiProperty({
    example: '[{"property_id":"660d5290e49538271705501e", "value": {"uz":"Salom", "en":"Hello"}}]',
    required: true,
  })
  properties: CreatePropertiesOnProductInterface[];

  @ApiProperty({
    example: '12000',
    required: true,
  })
  @Transform((data) => parseInt(data.value))
  @IsNumber()
  price: number;

  @ApiProperty({
    example: '100',
    required: true,
  })
  @Transform((data) => parseInt(data.value))
  @IsNumber()
  count: number;

  @ApiProperty({
    example: '660d5290e49538271705501e',
    required: true,
  })
  @IsString()
  category_id: string;

  @ApiProperty({
    example: '660d5290e49538271705501e',
    required: true,
  })
  @IsString()
  createdBy: string;
  
  @ApiProperty({
    maxItems: 8,
    type: 'array',
    items: {
      format: 'binary',
      type: 'string',
    },
  })
  images: any;

  @ApiProperty({
    format: 'binary',
    type: 'string',
    required:false
  })
  @IsOptional()
  video?: any;
}
