import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateOrderInterface, CreateOrderItemInterface } from '../interfaces';

export class CreateOrderDto implements CreateOrderInterface {
  @ApiProperty({
    example: '[{"product_id":"660d5290e49538271705501e", "quantity": 10}]',
    type: 'array',
  })
  orderItem: CreateOrderItemInterface[];

  @ApiProperty({
    example:"660d5290e49538271705501e",
    required: true
  })
  customer_id: string;

  @ApiProperty({
    example:"660d5290e49538271705501e",
    required: true
  })
  shop_id: string;
}