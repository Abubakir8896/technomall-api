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
    Req,
    UploadedFile,
    UseInterceptors,
  } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
  import { ApiBearerAuth, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
  import { Category, Order, Shop } from '@prisma/client';
import { PERMISSIONS } from '../../constants';
import { FileType } from '../category/interfaces';
import { CheckAuth, Permision } from '../decorators';
import { UpdateUserDto } from '../user/dtos';
import { CreateShopDto, UpdateShopDto } from './dtos';
import { ShopService } from './shop.service';
  
  @ApiBearerAuth("JWT")
  @ApiTags('Shop')
  @Controller({
    path: 'shop',
    version: '1.0',
  })
  export class ShopController {
    #_service: ShopService;
  
    constructor(service: ShopService) {
      this.#_service = service;
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.order.get_all_order)
    @ApiQuery({
      name:'page',
      required:false
    })
    @ApiQuery({
      name:'limit',
      required:false
    })
    @Get('find/all')
    async getShopList(
     @Headers('accept-language') languageCode: string,
      @Query('page') page?: number,
      @Query('limit') limit?: number,
    ): Promise<Shop[]> {
      return await this.#_service.getShopList(languageCode,page, limit);
    }

    @CheckAuth(false)
    @Permision(PERMISSIONS.order.get_all_order)
    @Get('find/:id')
    async getOneShop(
      @Param('id') shopId: string,
     @Headers('accept-language') languageCode: string,
    ): Promise<Shop> {
      return await this.#_service.getOneShop(shopId ,languageCode);
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.order.create_order)
    @Post('add')
    async createShop(
        @Body() payload: CreateShopDto,
        @Req() req: any
        ): Promise<void> {
      await this.#_service.createShop({...payload}, req.userId);
    }

    @CheckAuth(false)
    @Permision(PERMISSIONS.order.edit_order)
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('image'))
    @Patch('edit/:id')
    async updateCategory(
      @Param('id') shopId: string,
      @Body() payload: UpdateShopDto,
      @UploadedFile() image: FileType,
    ): Promise<void> {
      await this.#_service.updateShop({
        ...payload,
        id: shopId,
        image
      });
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.order.delete_order)
    @Delete('delete/:id')
    async deleteShop(@Param('id') id: string): Promise<void> {
      await this.#_service.deleteShop(id);
    }
}