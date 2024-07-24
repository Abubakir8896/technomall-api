import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { AddOneProductVideoInterface } from '../interfaces/add-one-product-video.interface';

export class AddOneProductVideoDto implements AddOneProductVideoInterface {
  @ApiProperty()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  video: any;
}