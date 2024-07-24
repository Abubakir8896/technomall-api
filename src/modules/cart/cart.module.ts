import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

@Module({
  controllers: [CartController],
  providers: [PrismaService, CartService],
})
export class CartModule {}