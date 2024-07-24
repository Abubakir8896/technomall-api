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
    UploadedFile,
    UseInterceptors,
  } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
  import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
  import { Category } from '@prisma/client';
import { PERMISSIONS } from '../../constants';
import { CheckAuth, Permision } from '../decorators';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dtos';
import { FileType } from './interfaces';
  
  @ApiBearerAuth("JWT")
  @ApiTags('Category')
  @Controller({
    path: 'category',
    version: '1.0',
  })
  export class CategoryController {
    #_service: CategoryService;
  
    constructor(service: CategoryService) {
      this.#_service = service;
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.category.get_all_categorys)
    @Get('find/all')
    async getTranslateList(
    @Headers('accept-language') languageCode: string,
    ): Promise<Category[]> {
      return await this.#_service.getCategoryList(languageCode);
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.category.get_one_category)
    @Get('find/:id')
    async getSingleCategoryList(
    @Param('id') categoryId:string,
    @Headers('accept-language') languageCode: string,
    ): Promise<Category> {
      return await this.#_service.getSingleCategory(languageCode, categoryId);
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.category.create_category)
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('image'))
    @Post('add')
    async createTranslate(
        @Body() payload: CreateCategoryDto,
        @UploadedFile() image: FileType,
        ): Promise<void> {
      await this.#_service.createCategory({...payload, image});
    }

    @CheckAuth(false)
    @Permision(PERMISSIONS.category.edit_category)
    @ApiConsumes('multipart/form-data')
    @Patch('edit/:id')
    @UseInterceptors(FileInterceptor('image'))
    async updateCategory(
      @Param('id') restourantId: string,
      @Body() payload: UpdateCategoryDto,
      @UploadedFile() image: any,
    ): Promise<void> {
      await this.#_service.updateCategory({
        ...payload,
        id: restourantId,
        image,
      });
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.category.delete_category)
    @Delete('delete/:id')
    async deleteCategory(@Param('id') id: string): Promise<void> {
      await this.#_service.deleteCategory(id);
    }

    @CheckAuth(false)
    @Permision(PERMISSIONS.category.search_category)
    @Get('/search')
    async searchCategory(
      @Headers('accept-language') languageCode: string,
      @Query('name') name: string,
    ): Promise<Category[]> {
      return await this.#_service.searchCategory({
        name,
        languageCode,
      });
    }
}