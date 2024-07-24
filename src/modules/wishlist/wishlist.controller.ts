import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
  } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
  import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
  import { Category, Wishlist } from '@prisma/client';
import { PERMISSIONS } from '../../constants';
import { CheckAuth, Permision } from '../decorators';
import { CreateWishlistDto } from './dtos';
import { WishlistService } from './wishlist.service';
  
  @ApiBearerAuth("JWT")
  @ApiTags('Wishlist')
  @Controller({
    path: 'wishlist',
    version: '1.0',
  })
  export class WishlistController {
    #_service: WishlistService;
  
    constructor(service: WishlistService) {
      this.#_service = service;
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.wishlist.get_all_wishlists)
    @Get('find/all')
    async getWishlist(
    ): Promise<Wishlist[]> {
      return await this.#_service.getWishlist();
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.wishlist.create_wishlist)
    @Post('add')
    async createWishlist(
        @Body() payload: CreateWishlistDto,
        ): Promise<void> {
      await this.#_service.createWishlist({...payload});
    }

    @CheckAuth(false)
    @Permision(PERMISSIONS.wishlist.delete_wishlist)  
    @Delete('delete/:id')
    async deleteCategory(@Param('id') id: string): Promise<void> {
      await this.#_service.deleteCategory(id);
    }
}