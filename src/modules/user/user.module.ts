import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MinioService } from '../../client';
import { LanguageService } from '../language/language.service';
import { ProductService } from '../product/product.service';
import { TranslateController } from '../translate/translate.controller';
import { TranslateService } from '../translate/translate.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [PrismaService, UserService, MinioService, TranslateService, ProductService, LanguageService],
})
export class UserModule {}