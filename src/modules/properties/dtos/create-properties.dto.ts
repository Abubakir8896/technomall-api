import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreatePropertiesInterface } from '../interfaces';

export class CreatePropertiesDto implements CreatePropertiesInterface {
  @ApiProperty({
    example: '660d5290e49538271705501e',
    required: true,
  })
  @IsString()
  name: string;
}
