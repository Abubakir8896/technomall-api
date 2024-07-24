import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { PrismaService } from '../../prisma/prisma.service';import { Roleservice } from './role.service';

@Module({
  controllers: [RoleController],
  providers: [PrismaService,Roleservice],
})
export class RoleModule {}