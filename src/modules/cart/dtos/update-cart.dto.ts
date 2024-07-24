import { IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UpdateCartInterface } from '../interfaces';

export class UpdateCartDto implements Omit<UpdateCartInterface, 'id'> {
  @ApiProperty({
    example:"150",
    required: true,
  })
  @IsOptional()
  @IsNumber()
  quantity?: number
}
