import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TranslateService } from '../translate/translate.service';
import { PropertyController } from './properties.controller';
import { PropertyService } from './properties.service';

@Module({
  controllers: [PropertyController],
  providers: [PrismaService, PropertyService, TranslateService],
})
export class PropertyModule {}