import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ModelController } from './model.controller';
import { ModelService } from './model.service';

@Module({
  controllers: [ModelController],
  providers: [PrismaService, ModelService],
})
export class ModelModule {}