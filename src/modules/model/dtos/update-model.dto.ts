import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UpdateModelInterface } from '../interfaces';

export class UpdateModelDto implements Omit<UpdateModelInterface, 'id'>{
  @ApiProperty({
    example: 'Samsung',
    required: true,
  })
  @IsString()
  name: string;
}
