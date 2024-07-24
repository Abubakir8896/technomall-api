import { Module } from "@nestjs/common";
import { LanguageController } from "./language.controller";
import { LanguageService } from "./language.service";
import { PrismaService } from '../../prisma/prisma.service';
import { MinioService } from "../../client";

@Module({
  controllers: [LanguageController],
  providers: [PrismaService,LanguageService, MinioService]
})
export class LanguageModule {}