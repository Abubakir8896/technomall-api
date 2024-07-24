import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';

@Module({
  controllers: [WishlistController],
  providers: [PrismaService, WishlistService],
})
export class WishlistModule {}