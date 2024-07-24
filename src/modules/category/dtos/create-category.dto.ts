import { CreateCategoryInterface } from '../interfaces';
import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto implements CreateCategoryInterface {
  @ApiProperty({
    example: '660d5290e49538271705501e',
    required: true,
  })
  @IsString()
  name: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required:false
  })
  @IsOptional()
  image?: any;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  category_id?: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  shop_id: string;
}
