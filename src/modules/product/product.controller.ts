import {
    Body,
    Controller,
    Post,
    Get,
    Patch,
    Param,
    Delete,
    Headers,
    UseInterceptors,
    UploadedFiles,
    Query,
    UploadedFile,
  } from '@nestjs/common';
  import { ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
  import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { CreateProductDto, DeleteProductVideoDto, UpdateProductDto } from './dtos';
import { FileType } from '../category/interfaces';
import { Product } from '@prisma/client';
import { AddOneProductImageDto } from './dtos/add-one-product-image.dto';
import { DeleteProductImageDto } from './dtos/delete-one-product-image.dto';
import { getProductResponse } from './interfaces';
import { CheckAuth, Permision } from '../decorators';
import { PERMISSIONS } from '../../constants';
  
  @ApiTags('Product')
  @Controller({
    path: 'product',
    version: '1.0',
  })
  export class ProductController {
    #_productService: ProductService;
  
    constructor(product: ProductService) {
      this.#_productService = product;
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.product.get_all_products)
    @ApiQuery({
      name:'page',
      required:false
    })
    @ApiQuery({
      name:'limit',
      required:false
    })
    @Get('find/all')
    async getProductList(
      @Headers('accept-language') languageCode: string,
      @Query('page') page?: number,
      @Query('limit') limit?: number,
    ): Promise<Product[]> {
      return await this.#_productService.getProductList({languageCode, page, limit});
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.product.get_one_product)
    @Get('find/one/:id')
    async getSingleProduct(
      @Headers('accept-language') languageCode: string,
      @Param('id') id:string
    ): Promise<Product[]> {
      return await this.#_productService.getSingleProduct(languageCode, id);
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.product.search_product)
    @Get('/search')
    async searchProduct(
      @Headers('accept-language') languageCode: string,
      @Query('title') title: string,
    ): Promise<Product[]> {
      return await this.#_productService.searchProduct({
        title,
        languageCode,
      });
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.product.create_product)
    @ApiConsumes('multipart/form-data')
    @Post('add')
    @UseInterceptors(
      FileFieldsInterceptor([
        { name: 'images', maxCount: 10 },
        { name: 'video' },
      ]),
    )
    async createProduct(
      @Body() payload: CreateProductDto,
      @UploadedFiles() files: { images: FileType[]; video: FileType },
    ): Promise<void> {
      return this.#_productService.createProduct({ ...payload, ...files });
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.product.add_product_image)
    @ApiConsumes('multipart/form-data')
    @Post('add/one/product-image')
    @UseInterceptors(FileInterceptor('image'))
    async addOneProductImage(
      @Body() payload: AddOneProductImageDto,
      @UploadedFile() image: any,
    ) {
      await this.#_productService.addOneProductImage({ image, ...payload });
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.product.add_product_video)
    @ApiConsumes('multipart/form-data')
    @Post('add/one/product-video')
    @UseInterceptors(FileInterceptor('video'))
    async addOneProductVideo(
      @Body() payload: AddOneProductImageDto,
      @UploadedFile() video: any,
    ) {
      await this.#_productService.addOneProductVideo({ video, ...payload });
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.product.edit_product)
    @Patch('edit/:id')
    async updateFood(
      @Param('id') productId: string,
      @Body() payload: UpdateProductDto,
    ): Promise<void> {
      await this.#_productService.updateProduct({ ...payload, id: productId });
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.product.delete_product_image)
    @Delete('delete/product-image')
    async deleteOneProductImage(@Body() payload: DeleteProductImageDto): Promise<void> {
      await this.#_productService.deleteOneProductImage(payload);
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.product.delete_product_video)
    @Delete('delete/product-video')
    async deleteOneProductVideo(@Body() payload: DeleteProductVideoDto): Promise<void> {
      await this.#_productService.deleteOneProductVideo(payload);
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.product.delete_product)
    @Delete('delete/:id')
    async deleteProduct(@Param('id') foodId: string): Promise<void> {
      await this.#_productService.deleteProduct(foodId);
    }
  }
  