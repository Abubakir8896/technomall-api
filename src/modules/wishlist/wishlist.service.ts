import { Wishlist } from '@prisma/client';
import {
  ConflictException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { CreateWishlistInterface } from './interfaces';

@Injectable()
export class WishlistService {
    #_prisma: PrismaService;
  
    constructor(prisma: PrismaService) {
      this.#_prisma = prisma;
    }

  async createWishlist(payload: CreateWishlistInterface): Promise<void> {
    await this.#_checkUser(payload.userId)
    await this.#_checkProduct(payload.productId)
      const newWishlist = await this.#_prisma.wishlist.create({data:{
        userId: payload.userId,
        productId:payload.productId,
  }})
  }

  async getWishlist(): Promise<Wishlist[]> {
    const data = await this.#_prisma.wishlist.findMany()

    return data
}

  async deleteCategory(id: string): Promise<void> {
    await this.#_checkWishlist(id);
        await this.#_prisma.wishlist.delete({ where:{id: id} });
  }


  async #_checkUser(id: string): Promise<void> {
    await this.#_checkId(id)
    const user = await this.#_prisma.user.findFirst({where:{id:id}});

    if (!user) {
      throw new ConflictException(`User with ${id} is not exists`);
    }
  }

  async #_checkWishlist(id: string): Promise<void> {
    await this.#_checkId(id)
    const wishlist = await this.#_prisma.wishlist.findFirst({where:{id:id}});

    if (!wishlist) {
      throw new ConflictException(`Wishlist with ${id} is not exists`);
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
