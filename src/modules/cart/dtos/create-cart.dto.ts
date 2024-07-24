import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateCartInterface } from '../interfaces';

export class CreateCartDto implements CreateCartInterface {
  @ApiProperty({
    example: '660d5290e49538271705501e',
    required: true,
  })
  @IsString()
  userId: string;

  @ApiProperty({
    example:"660d5290e49538271705501e",
    required: true,
  })
  @IsString()
  productId: string;

  @ApiProperty({
    example:"150",
    required: true,
  })
  @IsNumber()
  quantity: number
}
