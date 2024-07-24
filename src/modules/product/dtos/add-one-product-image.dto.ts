import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { AddOneProductImageInterface } from '../interfaces/add-one-product-image.interface';

export class AddOneProductImageDto implements AddOneProductImageInterface {
  @ApiProperty()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  image: any;
}
