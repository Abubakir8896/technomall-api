import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateModelInterface } from '../interfaces';

export class CreateModelDto implements CreateModelInterface {
  @ApiProperty({
    example: 'iPhone',
    required: true,
  })
  @IsString()
  name: string;
}
