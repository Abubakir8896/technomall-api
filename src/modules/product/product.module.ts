import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MinioService } from '../../client';
import { CategoryService } from '../category/category.service';
import { LanguageService } from '../language/language.service';
import { TranslateService } from '../translate/translate.service';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  controllers: [ProductController],
  providers: [PrismaService, ProductService, TranslateService, LanguageService, CategoryService, MinioService],
})
export class ProductModule {}