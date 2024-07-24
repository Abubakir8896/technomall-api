import { LanguageService } from './language.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CreateLanguageDto, UpdateLanguageDto } from './dtos';
import { Language } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileType } from '../category/interfaces';
import { CheckAuth, Permision } from '../decorators';
import { PERMISSIONS } from '../../constants';

@ApiTags('Language')
@Controller({
  path: 'language',
  version: '1.0',
})
export class LanguageController {
  #_service: LanguageService;

  constructor(service: LanguageService) {
    this.#_service = service;
  }

  @CheckAuth(false)
  @Permision(PERMISSIONS.language.get_all_languages)
  @Get()
  async getLanguageList(): Promise<Language[]> {
    return await this.#_service.getLanguageList();
  }

  @CheckAuth(false)
  @Permision(PERMISSIONS.language.create_language)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  @Post('add')
  async createLanguage(
    @Body() payload: CreateLanguageDto,
    @UploadedFile() image: FileType,
    ): Promise<void> {
    await this.#_service.createLanguage({ ...payload, image });
  }

  @CheckAuth(false)
  @Permision(PERMISSIONS.language.edit_language)
  @ApiConsumes('multipart/form-data')
  @Patch('edit/:id')
  @UseInterceptors(FileInterceptor('image'))
  async updateLanguage(
    @Body() payload: UpdateLanguageDto,
    @Param('id') id: string,
    @UploadedFile() image: any,
  ): Promise<void> {
    await this.#_service.updateLanguage({ id, ...payload, image });
  }

  @CheckAuth(false)
  @Permision(PERMISSIONS.language.delete_language)
  @Delete('delete/:id')
  async deleteLanguage(@Param('id') id: string): Promise<void> {
    await this.#_service.deleteLanguage(id);
  }
}