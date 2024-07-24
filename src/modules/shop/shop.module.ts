import { Module } from '@nestjs/common';
import { MinioService } from '../../client';
import { PrismaService } from '../../prisma';
import { LanguageService } from '../language/language.service';
import { ProductService } from '../product/product.service';
import { TranslateService } from '../translate/translate.service';
import { UserService } from '../user/user.service';
import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';

@Module({
  controllers: [ShopController],
  providers: [PrismaService, ShopService, UserService, MinioService, TranslateService, ProductService, LanguageService, UserService],
})
export class ShopModule {}