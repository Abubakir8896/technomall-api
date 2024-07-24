import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MinioService } from '../../client';
import { LanguageService } from '../language/language.service';
import { ProductService } from '../product/product.service';
import { TranslateService } from '../translate/translate.service';
import { UserService } from '../user/user.service';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  controllers: [OrderController],
  providers: [PrismaService, OrderService, ProductService, UserService, MinioService, TranslateService, LanguageService],
})
export class OrderModule {}