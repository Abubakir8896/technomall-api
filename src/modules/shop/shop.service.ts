import {
    BadRequestException,
    ConflictException,
    Injectable,
    UnprocessableEntityException
  } from '@nestjs/common';
  import { PrismaService } from '../../prisma';
import { Order, Shop } from '@prisma/client';
import { CreateShopRequest, UpdateShopRequest } from './interfaces';
import { MinioService } from '../../client';
import { TranslateService } from '../translate/translate.service';
  
  @Injectable()
  export class ShopService {
      #_prisma: PrismaService;
      #_minio: MinioService
      #_service: TranslateService
    
      constructor(prisma: PrismaService, minio: MinioService, service: TranslateService) {
        this.#_prisma = prisma;
        this.#_minio = minio;
        this.#_service = service;
      }
  
    async createShop(payload: CreateShopRequest, customerId: string): Promise<void> {
        await this.#_checkExistingShop(payload.name)
        await this.checkTranslate(payload.name)

        const newShop = await this.#_prisma.shop.create({data:{
            name:payload.name,
            phone:payload.phone,
            createdBy: "c4e234f2-c07e-4a9c-9771-0895c6fdd299",
        }})
    }

    async getShopList(languageCode: string, page?: number, limit?: number): Promise<Shop[]> {
      const defaultLimit = 20;
      const defaultPage = 1;
    
      const skip = ((page || defaultPage) - 1) * (limit || defaultLimit);
    
      const data = await this.#_prisma.shop.findMany({
        skip,
        take: Number(limit) || defaultLimit,
      });
    
      return await this.#_getShopList(data, languageCode)
    }

    async getOneShop(id:string, languageCode: string): Promise<Shop> {
      const data = await this.#_prisma.shop.findMany({where:{id: id}})
      const shop = await this.#_getShopList(data, languageCode)
      return shop[0]
    }
  
    async updateShop(payload: UpdateShopRequest): Promise<void> {
      await this.#_checkShop(payload.id)
      if(payload.name){
        await this.checkTranslate(payload.name)
        await this.#_checkExistingShop(payload.name)
        await this.#_prisma.shop.update({where:{id: payload.id}, data:{name: payload.name}})
      }
      if(payload.description){
        await this.checkTranslate(payload.description)
        await this.#_prisma.shop.update({where:{id: payload.id}, data:{description: payload.description}})
      }
      if(payload.phone){
        await this.#_prisma.shop.update({where:{id: payload.id}, data:{phone: payload.phone}})
      }
      if(payload.location){
        let longitude = ''
        let latitude = ''
        const location = JSON.parse(payload.location.toString())
        if(location.longitude){
            if(location.latitude){
                latitude = location.latitude
            }
            longitude = location.longitude
        }
        if(!longitude || !latitude){
            throw new BadRequestException("Longitude and Latitude is required")
        }
        await this.#_prisma.shop.update({where:{id: payload.id}, data:{longitude: longitude, latitude: latitude}})
      }
      if(payload.image){
        const deleteImageFile = await this.#_prisma.shop.findFirst({where:{id:payload.id}});
        await this.#_minio.removeFile({ fileName: deleteImageFile.image_url }).catch(undefined => undefined);
        const file = await this.#_minio.uploadFile({
          file: payload.image,
          bucket: 'shop',
        });
        await this.#_prisma.shop.update({
          where:{ id: payload.id },
          data:{image_url: file.fileName}}
        );
      }
    }
  
    async deleteShop(id: string): Promise<void> {
      await this.#_checkShop(id);
      const data = await this.#_prisma.shop.delete({where:{id:id}})
    }
  
    async #_checkExistingShop(name: string): Promise<void> {
      const shop = await this.#_prisma.shop.findFirst({where:{name: name}});
  
      if (shop) {
        throw new ConflictException(`Shop with ${name} is already available`);
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
        if (id?.length!=36) {
          throw new UnprocessableEntityException(`Invalid ${id} UUID`);
        }
      }

    async checkTranslate(id: string): Promise<void> {
      const translate = await this.#_prisma.translate.findFirst({where:{id:id}});
  
      if (!translate) {
        throw new ConflictException(`Translate with ${id} is not exists`);
      }
    }

    async #_getShopList(data, languageCode): Promise<Shop[]>{
      let result = [];
      let description: any = ""
  
      for (let x of data) {
        const shop: any = {};
  
        shop.id = x.id;
        const shop_name = await this.#_service.getSingleTranslate({
          translateId: x.name.toString(),
          languageCode: languageCode,
      })      
      if(x.description){
        description = await this.#_service.getSingleTranslate({
          translateId: x?.description?.toString(),
          languageCode: languageCode,
      })      
      }
      shop.name = shop_name.value;  
      shop.description = description.value? description.value: description;
      shop.image_url = x.image_url;
      shop.longitude = x.longitude;
      shop.latitude = x.latitude;
      shop.phone = x.phone
      result.push(shop)
      }
      return result
    }
  }