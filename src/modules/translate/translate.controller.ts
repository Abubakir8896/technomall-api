import {
    Body,
    Controller,
    Delete,
    Get,
    Headers,
    Param,
    Patch,
    Post,
    Query,
  } from '@nestjs/common';
  import { TranslateService } from './translate.service';
  import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
  import { CreateTranslateDto, UpdateTranslateDto } from './dtos';
  import { Translate } from '@prisma/client';
  import { GetSingleTranslateResponse } from './interfaces';
import { CheckAuth, Permision } from '../decorators';
import { PERMISSIONS } from '../../constants';
  
  @ApiBearerAuth("JWT")
  @ApiTags('Translate')
  @Controller({
    path: 'translate',
    version: '1.0',
  })
  export class TranslateController {
    #_service: TranslateService;
  
    constructor(service: TranslateService) {
      this.#_service = service;
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.translate.get_all_translates)
    @Get('find/all')
    async getTranslateList(): Promise<Translate[]> {
      return await this.#_service.getTranslateList();
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.translate.get_one_translate)
    @Get('find/:id')
    async retrieveSingleTranslate(
      @Param('id') translateId: string,
      @Headers('accept-language') languageCode: string,
    ): Promise<GetSingleTranslateResponse> {
      return await this.#_service.getSingleTranslate({
        languageCode,
        translateId,
      });
    }

    @CheckAuth(false)
    @Permision(PERMISSIONS.translate.search_translate_by_code)
    @Get('/search')
    async searchTranslate(
      @Query('code') code: string,
    ): Promise<Translate[]> {
      return await this.#_service.searchTranslate({
        code
      });
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.translate.get_single_translate_by_code)
    @Get('find/code/:code')
    async getSingleTranslateByCode(
      @Param('code') code: string,
    ): Promise<Translate[]> {
      return await this.#_service.getSingleTranslateByCode(code);
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.translate.create_translate)
    @Post('add')
    async createTranslate(@Body() payload: CreateTranslateDto): Promise<string> {
      return await this.#_service.createTranslate(payload);
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.translate.edit_translate)
    @Patch('edit/:id')
    async updateTranslate(
      @Param('id') translateId: string,
      @Body() payload: UpdateTranslateDto,
    ): Promise<void> {
      await this.#_service.updateTranslate({ ...payload, id: translateId });
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.translate.delete_translate)
    @Delete('delete/:id')
    async deleteTranslate(@Param('id') translateId: string): Promise<void> {
      await this.#_service.deleteTranslate(translateId);
    }
  }