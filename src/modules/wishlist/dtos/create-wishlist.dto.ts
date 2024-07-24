import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateWishlistInterface } from '../interfaces';

export class CreateWishlistDto implements CreateWishlistInterface {
  @ApiProperty({
    example: '660d5290e49538271705501e',
    required: true,
  })
  @IsString()
  userId: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  productId: string;
}
