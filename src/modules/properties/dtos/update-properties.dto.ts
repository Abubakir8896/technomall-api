import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UpdatePropertiesInterface } from '../interfaces';

export class UpdatePropertiesDto implements Omit<UpdatePropertiesInterface, 'id'>{
  @ApiProperty({
    example: '660d5290e49538271705501e',
    required: false,
  })
  @IsString()
  name: string;
}
