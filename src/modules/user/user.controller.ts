import {
    Body,
    Controller,
    Delete,
    Get,
    Headers,
    Param,
    Patch,
    Post,
    Req,
    UploadedFile,
    UseInterceptors,
  } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
  import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
  import { Category, User } from '@prisma/client';
import { FileType } from '../category/interfaces';
import { PERMISSIONS } from '../../constants';
import { CheckAuth, Permision } from '../decorators';
import { CreateUserDto, UpdateUserDto } from './dtos';
import { UserService } from './user.service';
  
  @ApiBearerAuth("JWT")
  @ApiTags('User')
  @Controller({
    path: 'user',
    version: '1.0',
  })
  export class UserController {
    #_service: UserService;
  
    constructor(service: UserService) {
      this.#_service = service;
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.user.get_all_users)
    @Get('find/all')
    async getUserList(
    ): Promise<User[]> {
      return await this.#_service.getUserList();
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.user.get_one_user)
    @Get('/user/by/:userId')
    async getSingleUserByUserID(@Param("userId") userId: string): Promise<User> {
      return await this.#_service.getSingleUser(userId);
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.user.create_user)
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('image'))
    @Post('add')
    async createUser(
        @Body() payload: CreateUserDto,
        @UploadedFile() image: FileType,
        @Req() req: any
        ): Promise<void> {
      await this.#_service.createUser({...payload, image}, req.userId);
    }

    @CheckAuth(false)
    @Permision(PERMISSIONS.user.edit_user)
    @ApiConsumes('multipart/form-data')
    @Patch('edit/:id')
    @UseInterceptors(FileInterceptor('image'))
    async updateUser(
      @Param('id') userId: string,
      @Body() payload: UpdateUserDto,
      @UploadedFile() image: any,
      @Req() req: any
    ): Promise<void> {
      await this.#_service.updateUser({
        id: userId,
        ...payload,
        image,
      }, req.userId);
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.user.delete_user)
    @Delete('delete/:id')
    async deleteUser(@Param('id') id: string): Promise<void> {
      await this.#_service.deleteUser(id);
    }
}