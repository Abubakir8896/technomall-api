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
  import { Permission, Properties } from '@prisma/client';
import { PERMISSIONS } from '../../constants';
import { CheckAuth, Permision } from '../decorators';
import { CreatePermissionDto, UpdatePermissionDto } from './dtos';
import { PermissionService } from './permission.service';
  
  @ApiBearerAuth("JWT")
  @ApiTags('Permission')
  @Controller({
    path: 'permission',
    version: '1.0',
  })
  export class PermissionController {
    #_service: PermissionService;
  
    constructor(service: PermissionService) {
      this.#_service = service;
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.permission.get_all_permissions)
    @Get('find/all')
    async getPermissionList(
    ): Promise<Permission[]> {
      return await this.#_service.getPermissionList();
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.permission.get_one_permission)
    @Get('find/:id')
    async getSinglePermission(
    @Param('id') permissionId:string,
    ): Promise<Permission[]> {
      return await this.#_service.getSinglePermission(permissionId);
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.permission.create_permission)
    @Post('add')
    async createPermission(
        @Body() payload: CreatePermissionDto,
        ): Promise<void> {
      await this.#_service.createPermission({...payload});
    }

    @CheckAuth(false)
    @Permision(PERMISSIONS.permission.edit_permission)
    @Patch('edit/:id')
    async updatePermission(
      @Param('id') propertyId: string,
      @Body() payload: UpdatePermissionDto,
    ): Promise<void> {
      await this.#_service.updatePermission({
        ...payload,
        id: propertyId
    });
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.permission.delete_permission)
    @Delete('delete/:id')
    async deletePermission(@Param('id') id: string): Promise<void> {
      await this.#_service.deletePermission(id);
    }
}