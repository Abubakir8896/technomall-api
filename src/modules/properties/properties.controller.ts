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
  import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
  import { Properties } from '@prisma/client';
import { PERMISSIONS } from '../../constants';
import { CheckAuth, Permision } from '../decorators';
import { CreatePropertiesDto, UpdatePropertiesDto } from './dtos';
import { PropertyService } from './properties.service';
  
  @ApiBearerAuth("JWT")
  @ApiTags('Property')
  @Controller({
    path: 'property',
    version: '1.0',
  })
  export class PropertyController {
    #_service: PropertyService;
  
    constructor(service: PropertyService) {
      this.#_service = service;
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.property.get_all_propertys)
    @Get('find/all')
    async getPropertyList(
    @Headers('accept-language') languageCode: string,
    ): Promise<Properties[]> {
      return await this.#_service.getPropertyList(languageCode);
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.property.get_one_property)
    @Get('find/:id')
    async getSingleProperty(
    @Param('id') categoryId:string,
    @Headers('accept-language') languageCode: string,
    ): Promise<Properties[]> {
      return await this.#_service.getSingleProperty(languageCode, categoryId);
    }

    @CheckAuth(false)
    @Permision(PERMISSIONS.property.search_property)
    @Get('/search')
    async searchProperty(
      @Headers('accept-language') languageCode: string,
      @Query('name') name: string,
    ): Promise<Properties[]> {
      return await this.#_service.searchProperty({
        name,
        languageCode,
      });
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.property.create_property)
    @Post('add')
    async createProperty(
        @Body() payload: CreatePropertiesDto,
        ): Promise<void> {
      await this.#_service.createProperty({...payload});
    }

    @CheckAuth(false)
    @Permision(PERMISSIONS.property.edit_property)
    @Patch('edit/:id')
    async updateProperties(
      @Param('id') propertyId: string,
      @Body() payload: UpdatePropertiesDto,
    ): Promise<void> {
      await this.#_service.updateProperties({
        ...payload,
        id: propertyId
    });
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.property.delete_property)
    @Delete('delete/:id')
    async deleteProperty(@Param('id') id: string): Promise<void> {
      await this.#_service.deleteProperty(id);
    }
}