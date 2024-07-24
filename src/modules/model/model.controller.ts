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
  import { Model, Properties } from '@prisma/client';
import { CheckAuth, Permision } from '../decorators';
import { CreateModelDto, UpdateModelDto } from './dtos';
import { ModelService } from './model.service';
import { PERMISSIONS } from '../../constants';
  
  @ApiBearerAuth("JWT")
  @ApiTags('Model')
  @Controller({
    path: 'model',
    version: '1.0',
  })
  export class ModelController {
    #_service: ModelService;
  
    constructor(service: ModelService) {
      this.#_service = service;
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.model.get_all_models)
    @Get('find/all')
    async getModelList(
    ): Promise<Model[]> {
      return await this.#_service.getModelList();
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.model.get_one_model)
    @Get('find/:id')
    async getSingleModel(
    @Param('id') modelId:string,
    ): Promise<Model[]> {
      return await this.#_service.getSingleModel(modelId);
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.model.create_model)
    @Post('add')
    async createModel(
        @Body() payload: CreateModelDto,
        ): Promise<void> {
      await this.#_service.createModel({...payload});
    }

    @CheckAuth(false)
    @Permision(PERMISSIONS.model.edit_model)
    @Patch('edit/:id')
    async updateModel(
      @Param('id') propertyId: string,
      @Body() payload: UpdateModelDto,
    ): Promise<void> {
      await this.#_service.updateModel({
        ...payload,
        id: propertyId
    });
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.model.delete_model)
    @Delete('delete/:id')
    async deleteModel(@Param('id') id: string): Promise<void> {
      await this.#_service.deleteModel(id);
    }
}