import { IsOptional, IsPhoneNumber, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { location, UpdateShopRequest } from '../interfaces';

export class UpdateShopDto implements Omit<UpdateShopRequest, 'id'> {
  @ApiProperty({example:"660d5290e49538271705501e", required: false})
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({example:"660d5290e49538271705501e", required: false})
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({example: "{'longtitude': '5489416', 'langtitude': '849415'}", required: false})
  @IsOptional()
  location?: location;

  @ApiProperty({example:"+998930010001", required: false})
  @IsOptional()
  @IsPhoneNumber("UZ")
  phone?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  image?: any;
}