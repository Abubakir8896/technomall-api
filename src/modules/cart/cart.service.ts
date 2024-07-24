import { Wishlist, Cart } from '@prisma/client';
import {
    BadRequestException,
  ConflictException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { CreateCartInterface, UpdateCartInterface } from './interfaces';
import { ProductService } from '../product/product.service';

@Injectable()
export class CartService {
    #_prisma: PrismaService;
  
    constructor(prisma: PrismaService) {
      this.#_prisma = prisma;
    }

  async createCart(payload: CreateCartInterface): Promise<void> {
    await this.#_checkUser(payload.userId)
    await this.#_checkProduct(payload.productId)
    const quantity = Number(payload.quantity)
    const product = await this.#_prisma.product.findFirst({where:{id:payload.productId}})
    if(product.count<quantity && product.count-quantity<0){
        throw new BadRequestException("So many products are not available")
    }
    const newCart = await this.#_prisma.cart.create({data:{
        userId: payload.userId,
        productId:payload.productId,
        quantity:quantity,
  }})
  }


  async getCart(): Promise<Cart[]> {
    const data = await this.#_prisma.cart.findMany()

    return data
}

  async deleteCart(id: string): Promise<void> {
    await this.#_checkCart(id);
        await this.#_prisma.cart.delete({ where:{id: id} });
  }

  async updateCart(payload:UpdateCartInterface): Promise<void>{
    await this.#_checkCart(payload.id);
    const quantity = Number(payload.quantity)
    const cart = await this.#_prisma.cart.findFirst({where:{id:payload.id}})
    const product = await this.#_prisma.product.findFirst({where:{id:cart.productId}})
    if(product.count<quantity && product.count-quantity<0){
        throw new BadRequestException("So many products are not available")
    }

    const UpdatedCart = await this.#_prisma.cart.update({where:{id:payload.id}, data:{
        quantity:quantity,
    }})
  }

  async #_checkUser(id: string): Promise<void> {
    await this.#_checkId(id)
    const user = await this.#_prisma.user.findFirst({where:{id:id}});

    if (!user) {
      throw new ConflictException(`User with ${id} is not exists`);
    }
  }

  async #_checkCart(id: string): Promise<void> {
    await this.#_checkId(id)
    const cart = await this.#_prisma.cart.findFirst({where:{id:id}});

    if (!cart) {
      throw new ConflictException(`Cart with ${id} is not exists`);
    }
  }

  async #_checkProduct(id: string): Promise<void> {
    await this.#_checkId(id)
    const product = await this.#_prisma.product.findFirst({where:{id:id}});

    if (!product) {
      throw new ConflictException(`Product with ${id} is not exists`);
    }
  }

  async #_checkId(id: string): Promise<void> {
    if (id.length!=36) {
      throw new UnprocessableEntityException(`Invalid ${id} UUID`);
    }
  }
}
