import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ModelService } from '../model/model.service';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';

@Module({
  controllers: [PermissionController],
  providers: [PrismaService, PermissionService, ModelService],
})
export class PermissionModule {}