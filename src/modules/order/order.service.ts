import {
    BadRequestException,
    ConflictException,
    Injectable,
    UnprocessableEntityException
  } from '@nestjs/common';
  import { PrismaService } from '../../prisma';
import { CreateOrderInterface, GetFilteredOrderesRequest, UpdateOrderInterface } from './interfaces';
import { ProductService } from '../product/product.service';
import { UserService } from '../user/user.service';
import { Order } from '@prisma/client';
  
  @Injectable()
  export class OrderService {
      #_prisma: PrismaService;
      #_product: ProductService;
      #_customer: UserService
    
      constructor(prisma: PrismaService, product:ProductService, customer: UserService) {
        this.#_prisma = prisma;
        this.#_product = product;
        this.#_customer = customer;
      }
  
    async createOrder(payload: CreateOrderInterface): Promise<void> {
            if(!payload.orderItem){
              throw new BadRequestException("OrderItem is not empty")
            }
            for(const item of payload.orderItem){
              if(!item.quantity || typeof(item.quantity)!='number'){
                throw new BadRequestException("Quantity must be number")
              }
              if(!item.product_id || typeof(item.product_id)!='string'){
                throw new BadRequestException("Product ID must be string")
              }
              await this.#_checkProduct(item.product_id)
            }

            let total_price = 0
            for(const item of payload.orderItem){
              const product = await this.#_prisma.product.findFirst({where:{id:item.product_id}})
              total_price+=product.price*item.quantity
            }

            await this.#_checkShop(payload.shop_id)

            const newOrder = await this.#_prisma.order.create({data:{
              customer_id: payload.customer_id,
              total_price:total_price,
              shop_id: payload.shop_id
            }})

            for(const item of payload.orderItem){
              const product = await this.#_prisma.product.findFirst({where:{id:item.product_id}})
              const newOrderItem = await this.#_prisma.orderItem.create({data:{
                quantity:item.quantity,
                price:product.price,
                product_id:item.product_id,
                order_id:newOrder.id
              }})
            }
    }

    async getOrdersByUserId(userId): Promise<Order[]> {
      const data = await this.#_prisma.order.findMany({where:{customer_id:userId}})
      return data
    }

    async getFilteredOrderList(
      payload: GetFilteredOrderesRequest,
    ): Promise<Order[]> {
      const datas = []
      const result = []
      let data:any = []
      if(payload.status){
        data = await this.#_prisma.order.findMany({where:{status:payload.status}})
      }else{
        data = await this.#_prisma.order.findMany()
      }
      if(payload.first_date){
        const isDateString = await this.isDateValid(payload.first_date);
        if(isDateString==false){
          throw new BadRequestException("First Date is Not IsDateString")
        }
        let date = payload.first_date.split('-')
        for(const item of data){ 
          if(Number(date[2]<item.order_date.getFullYear())){
            datas.push(item)
          }
          if(Number(date[2])==item.order_date.getFullYear() && (Number(date[1]))<item.order_date.getMonth()+1){            
            datas.push(item)
          }          
          if(Number(date[2])==item.order_date.getFullYear() && Number(date[1])==item.order_date.getMonth()+1 && Number(date[0])<=item.order_date.getDay()){
            datas.push(item)
          }
        }
      }
      if(payload.second_date){
        const isDateString = await this.isDateValid(payload.second_date);
        if(isDateString==false){
          throw new BadRequestException("Second Date is Not IsDateString")
        }
        if(datas[0]){
          let date = payload.second_date.split('-')
          for(const item of datas){ 
            if(Number(date[2]>item.order_date.getFullYear())){
              result.push(item)
            }
            if(Number(date[2])==item.order_date.getFullYear() && (Number(date[1]))>item.order_date.getMonth()+1){            
              result.push(item)
            }          
            if(Number(date[2])==item.order_date.getFullYear() && Number(date[1])==item.order_date.getMonth()+1 && Number(date[0])>=item.order_date.getDay()){
              result.push(item)
            }
        }
        }else{
          let date = payload.second_date.split('-')
          for(const item of data){ 
            if(Number(date[2]>item.order_date.getFullYear())){
              result.push(item)
            }
            if(Number(date[2])==item.order_date.getFullYear() && (Number(date[1]))>item.order_date.getMonth()+1){            
              result.push(item)
            }          
            if(Number(date[2])==item.order_date.getFullYear() && Number(date[1])==item.order_date.getMonth()+1 && Number(date[0])>=item.order_date.getDay()){
              result.push(item)
            }
        }
        }
      }
      if(datas[0] && !payload.second_date){
        return datas
      }else{        
        return result
      }
    }

    async getOrderList(page?: number, limit?: number): Promise<Order[]> {
      const defaultLimit = 20;
      const defaultPage = 1;
    
      const skip = ((page || defaultPage) - 1) * (limit || defaultLimit);
    
      const data = await this.#_prisma.order.findMany({
        include: { orderitem: true },
        skip,
        take: Number(limit) || defaultLimit,
      });
    
      return data;
    }
  
    async updateOrder(payload: UpdateOrderInterface): Promise<void> {
      await this.#_checkOrder(payload.id)
      await this.#_prisma.order.update({where:{id:payload.id}, data:{status:payload.status}})
    }
  
    async deleteOrder(id: string): Promise<void> {
      await this.#_checkOrder(id);
      const data = await this.#_prisma.order.findFirst({where:{id:id},include:{orderitem:true}})
    }
  
    async #_checkProduct(id: string): Promise<void> {
    await this.#_checkId(id)
      const product = await this.#_prisma.product.findFirst({where:{id:id}});
  
      if (!product) {
        throw new ConflictException(`Product with ${id} is not exists`);
      }
    }
  
    async #_checkOrder(id: string): Promise<void> {
    await this.#_checkId(id)
      const order = await this.#_prisma.order.findFirst({where:{id:id}});
  
      if (!order) {
        throw new ConflictException(`Order with ${id} is not exists`);
      }
    }
  
    async #_checkShop(id: string): Promise<void> {
    await this.#_checkId(id)
      const shop = await this.#_prisma.shop.findFirst({where:{id:id}});
  
      if (!shop) {
        throw new ConflictException(`Shop with ${id} is not exists`);
      }
    }

    async #_checkCustomer(id: string): Promise<void> {
    await this.#_checkId(id)
      const customer = await this.#_prisma.user.findFirst({where:{id:id}});
  
      if (!customer) {
        throw new ConflictException(`User with ${id} is not exists`);
      }
    }
  
    async #_checkId(id: string): Promise<void> {
        if (id.length!=36) {
          throw new UnprocessableEntityException(`Invalid ${id} UUID`);
        }
      }

    async checkTranslate(id: string): Promise<void> {
      const translate = await this.#_prisma.translate.findFirst({where:{id:id}});
  
      if (!translate) {
        throw new ConflictException(`Translate with ${id} is not exists`);
      }
    }
    async isDateValid(dateString: string): Promise<boolean> {
      const [day, month, year] = dateString.split('-');
      const isValidFormat = /^\d{2}-\d{2}-\d{4}$/.test(dateString);
      const isValidDate = Number(day) <= 31 && Number(month) <= 12;
      return isValidFormat && isValidDate;
    }
  }
  