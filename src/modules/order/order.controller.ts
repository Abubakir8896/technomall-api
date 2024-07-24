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
  import { ApiBearerAuth, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
  import { Category, Order } from '@prisma/client';
import { PERMISSIONS } from '../../constants';
import { CheckAuth, Permision } from '../decorators';
import { CreateOrderDto, UpdateOrderDto } from './dtos';
import { GetFilteredOrderesRequest } from './interfaces';
import { OrderService } from './order.service';
  
  @ApiBearerAuth("JWT")
  @ApiTags('Order')
  @Controller({
    path: 'order',
    version: '1.0',
  })
  export class OrderController {
    #_service: OrderService;
  
    constructor(service: OrderService) {
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
    async getOrderList(
      @Query('page') page?: number,
      @Query('limit') limit?: number,
    ): Promise<Order[]> {
      return await this.#_service.getOrderList(page, limit);
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.order.get_one_order)
    @Get('find/:id')
    async getOrdersByUserId(
      @Param('id') userId:string
    ): Promise<Order[]> {
      return await this.#_service.getOrdersByUserId(userId);
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.order.filter_order)
    @ApiQuery({
      name:'first_date',
      required:false
    })
    @ApiQuery({
      name:'second_date',
      required:false
    })
    @ApiQuery({
      name:'status',
      required:false
    })
    @Get('filter')
    async getFilteredOrderList(
      @Query('first_date') first_date?: string,
      @Query('second_date') second_date?: string,
      @Query('status') status?: string,
      ): Promise<Order[]> {
      return await this.#_service.getFilteredOrderList({first_date, second_date});
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.order.create_order)
    @Post('add')
    async createOrder(
        @Body() payload: CreateOrderDto,
        ): Promise<void> {
      await this.#_service.createOrder({...payload});
    }

    @CheckAuth(false)
    @Permision(PERMISSIONS.order.edit_order)
    @Patch('edit/:id')
    async updateCategory(
      @Param('id') orderId: string,
      @Body() payload: UpdateOrderDto,
    ): Promise<void> {
      await this.#_service.updateOrder({
        ...payload,
        id: orderId,
      });
    }
  
    @CheckAuth(false)
    @Permision(PERMISSIONS.order.delete_order)
    @Delete('delete/:id')
    async deleteOrder(@Param('id') id: string): Promise<void> {
      await this.#_service.deleteOrder(id);
    }
}