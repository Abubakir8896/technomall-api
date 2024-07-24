import {
  BadRequestException,
    ConflictException,
    Injectable,
    UnprocessableEntityException,
  } from '@nestjs/common';
  import { Product } from '@prisma/client';
  import { v4 as uuidv4 } from 'uuid';
  import { MinioService } from '../../client';
  import { PrismaService } from '../../prisma';
  import { LanguageService } from '../language/language.service';
  import { TranslateService } from '../translate/translate.service';
  import { DeleteProductImageDto } from './dtos/delete-one-product-image.dto';
  import { AddOneProductVideoInterface, CreateProductInterface, DeleteProductVideoInterface, GetProductList, getProductResponse, UpdateProductRequest } from './interfaces';
  import { AddOneProductImageInterface } from './interfaces/add-one-product-image.interface';
  import { SearchProductInterface } from './interfaces/search-product.interface';
  
  @Injectable()
  export class ProductService {
    #_prisma: PrismaService;
    #_minio: MinioService;
    #_translate: TranslateService;
    #_language: LanguageService;
    #_definition:TranslateService;
    
    constructor(prisma: PrismaService, minio:MinioService, service:TranslateService, language:LanguageService, definition:TranslateService) {
      this.#_prisma = prisma;
      this.#_minio = minio;
      this.#_translate = service;
      this.#_language = language;
      this.#_definition = definition;
    }
    
    async createProduct(payload: CreateProductInterface): Promise<void> {      
      await this.#_checkCategory(payload.category_id);
      
      let propertyOnProduct = JSON.parse(`${payload.properties}`);
      
      if(typeof propertyOnProduct=='object'){
          propertyOnProduct = [propertyOnProduct]
      }
            
      
      for(const item of propertyOnProduct){
        await this.#_checkProperty(item.property_id)
      }
  
      const name = JSON.parse(`${payload.title}`);
      const name_kays_array = Object.keys(name);
      const description = JSON.parse(`${payload.description}`);
      const description_kays_array = Object.keys(description);
  
      for (let languageCode of name_kays_array) {
        await this.#_checkLanguage(languageCode);
      }
  
      for (let languageCode of description_kays_array) {
        await this.#_checkLanguage(languageCode);
      }
    
      const translate_title = await this.#_translate.createTranslate({
        code: uuidv4(),
        definition: name,
        type: 'content',
      });
      const translate_description = await this.#_translate.createTranslate({
        code: uuidv4(),
        definition: description,
        type: 'content',
      });      
  
      const files = [];
      let video = ''
  
      for (let photo of payload.images) {
        const fileNames = await this.#_minio.uploadFile({
          file: photo,
          bucket: 'shop',
        });
        files.push(fileNames.fileName);
      }
  
      if(payload.video){
        for(let video of payload.video){
          const fileName = await this.#_minio.uploadFile({
              file:video,
              bucket:"shop"
          });
          video = fileName.fileName
        }


      }      

      const category = await this.#_prisma.category.findFirst({where:{id: payload.category_id}})

      const newProduct = await this.#_prisma.product.create({
        data:{
          title: translate_title,
          description: translate_description,
          price: Number(payload.price),
          count: Number(payload.count),
          category_id: payload.category_id,
          shop_id: category.shop_id,
          image_urls: files,
          video_url: video,
          createdBy:payload.createdBy
      }});
        
      for(const item of propertyOnProduct){
        
        const value_kays_array = Object.keys(item.value);

        const languages = await this.#_prisma.language.findMany()

        if(value_kays_array.length!=languages.length){
          throw new BadRequestException("Enter in all languages")
        }

        for (let languageCode of value_kays_array) {
          await this.#_checkLanguage(languageCode);
        }
      const translate_value = await this.#_translate.createTranslate({
        code: uuidv4(),
        definition: item.value,
        type: 'content',
      });

      const newPropertyOnProduct = await this.#_prisma.propertiesOnProduct.create({
        data:{
          productId:newProduct.id,
          propertiesId:item.property_id,
          value:translate_value
        }
      })
    }
  }
  
    async searchProduct(payload: SearchProductInterface): Promise<Product[]> {  
      const data = await this.getProductList({languageCode:payload.languageCode});
      
      if (!payload.title.length || !data.length) {
        return data;
      }
  
      let result = [];
      for (const product of data) {   
           
        if (
          product.title
            .toLocaleLowerCase()
            .includes(payload.title.toLocaleLowerCase()) ||
            product.description
            .toLocaleLowerCase()
            .includes(payload.title.toLocaleLowerCase())
        ) {
          result.push(product);
        }
      }
      return result;
    }
  
    async getSingleProduct(languageCode: string, id:string): Promise<Product[]> {
      const data = await this.#_prisma.product.findMany({where:{id:id}, include:{properties_on_product:
        {
          include: {
            properties: true
          }
    }}})
    return await this.#_getSingleProductForAdmin(data, languageCode)
    }

    async getProductList(payload: GetProductList): Promise<Product[]> {
      const defaultLimit = 20;
      const defaultPage = 1;
    
      const skip = ((payload.page || defaultPage) - 1) * (payload.limit || defaultLimit);
    
      const data = await this.#_prisma.product.findMany({
        include: {
          properties_on_product: {
            include: {
              properties: true
            }
          }
        },
        skip,
        take: Number(payload.limit) || defaultLimit,
      });
      
      return await this.#_getSingleProductForAdmin(data, payload.languageCode)
    }
    async updateProduct(payload: UpdateProductRequest): Promise<void> {
      await this.#_checkProduct(payload.id);
      
      
      if (payload.status) {
        await this.#_prisma.product.update(
          { where:{ id: payload.id },
          data:{
            status: payload.status,
          }},
          );
        }
        
        if (payload.title) {
          const title_kays_array = Object.keys(payload.title);
          for (let languageCode of title_kays_array) {
            await this.#_checkLanguage(languageCode);
          }
          const translatefindByID = await this.#_prisma.product.findFirst({where:{id:payload.id}});
          
          const translate = await this.#_prisma.translate.findFirst({
            where:{id:translatefindByID.title}
          }
          );
          
          await this.#_prisma.definition.deleteMany({where:{translateId: translate.id}});
        
        for (const item of title_kays_array) {
          const language = await this.#_prisma.language.findFirst({where: { code: item }});
          
          const newDefinition = await this.#_prisma.definition.create({data:{
            languageId: language.id,
            translateId: translate.id,
            value: payload.title[item],
          }});
        }
      }
      
      if (payload.description) {
        const description_kays_array = Object.keys(payload.description);
        for (let languageCode of description_kays_array) {
          await this.#_checkLanguage(languageCode);
        }
        const translatefindByID = await this.#_prisma.product.findFirst({where:{id:payload.id}});
        
        const translate = await this.#_prisma.translate.findFirst({
          where: {id:translatefindByID.description,}
        });
        
        await this.#_prisma.definition.deleteMany({where:{ translateId: translate.id }});
        
        await this.#_prisma.translate.update({where:{id:translatefindByID.description}, data:{
          definition: {},
        }});
        
        for (const item of description_kays_array) {
          const language = await this.#_prisma.language.findFirst({where:{ code: item }});
          
          const newDefinition = await this.#_prisma.definition.create({data:{
            languageId: language.id,
            translateId: translate.id,
            value: payload.description[item],
          }});
        }
      }
      if (payload.properties) {
        await this.#_checkPropertyOnProduct(payload.properties.property_id)
        const propertyOnProduct_kays_array = Object.keys(payload.properties.value);

        const languages = await this.#_prisma.language.findMany()


        if(propertyOnProduct_kays_array.length!=languages.length){
          throw new BadRequestException("Enter in all languages")
        }

        for (let languageCode of propertyOnProduct_kays_array) {
          await this.#_checkLanguage(languageCode);
        }
        const translatefindByID = await this.#_prisma.propertiesOnProduct.findFirst({where:{id:payload.properties.property_id}});
        
        const translate = await this.#_prisma.translate.findFirst({
          where: {id:translatefindByID.value}
        });
                
        await this.#_prisma.definition.deleteMany({where:{ translateId: translate.id }});
        
        await this.#_prisma.translate.update({where:{id:translatefindByID.value}, data:{
          definition: {},
        }});
        
        for (const item of propertyOnProduct_kays_array) {
          const language = await this.#_prisma.language.findFirst({where:{ code: item }});
          
          const newDefinition = await this.#_prisma.definition.create({data:{
            languageId: language.id,
            translateId: translate.id,
            value: payload.properties.value[item],
          }});
       
        }
      }
      if (payload.price) {                
        await this.#_prisma.product.update({
          where:{ id: payload.id },
          data:{
            price: payload.price,
          }},
          );
        }
          
      if (payload.count) {
        await this.#_prisma.product.update({
          where:{ id: payload.id },
          data:{
            count: payload.count,
          }},
          );
      }
  }
  
    async addOneProductImage(payload: AddOneProductImageInterface): Promise<void> {
      await this.#_checkProduct(payload.productId);
  
      const imageUrl = await this.#_minio.uploadFile({
        file: payload.image,
        bucket: 'shop',
      });

      await this.#_prisma.product.update({where: {id: payload.productId},  data: {image_urls: {
        push: imageUrl.fileName
      }}})
    }
  
    async addOneProductVideo(payload: AddOneProductVideoInterface): Promise<void> {
      await this.#_checkProduct(payload.productId);
      const product = await this.#_prisma.product.findFirst({where:{id:payload.productId}})   
      
      if(product.video_url.length){
        throw new BadRequestException("You can only enter one video")
      }
  
      const videoUrl = await this.#_minio.uploadFile({
        file: payload.video,
        bucket: 'shop',
      });

      await this.#_prisma.product.update({where: {id: payload.productId},  data: {video_url: videoUrl.fileName}})
    }
  
    async deleteOneProductImage(payload: DeleteProductImageDto): Promise<void> {
      await this.#_checkProduct(payload.productId);
  
      const foundedProduct = await this.#_prisma.product.findFirst({where:{id:payload.productId}});
  
      if (!foundedProduct.image_urls.includes(payload.image_url)) {
        return;
      }

      const images = foundedProduct.image_urls.filter(img => img != payload.image_url)

      await this.#_prisma.product.update({
        where: { id: foundedProduct.id },
        data: {
          image_urls: {
            set: images,
          },
        },
      });

      await this.#_minio
        .removeFile({ fileName: payload.image_url })
        .catch((undefined) => undefined);
    }

    async deleteOneProductVideo(payload: DeleteProductVideoInterface): Promise<void> {
      await this.#_checkProduct(payload.productId);
  
      const foundedProduct = await this.#_prisma.product.findFirst({where:{id:payload.productId}});
      await this.#_prisma.translate.delete({where:{id:foundedProduct.title}})
      await this.#_prisma.translate.delete({where:{id:foundedProduct.description}})
  
      if (!foundedProduct.video_url.includes(payload.video_url)) {
        return;
      }            

      await this.#_prisma.product.update({
        where: { id: foundedProduct.id },
        data: {
          video_url: ''
        },
      });   

      await this.#_minio
        .removeFile({ fileName: payload.video_url })
        .catch((undefined) => undefined);
    }
  
    async deleteProduct(id: string): Promise<void> {
      await this.#_checkProduct(id);
      const deleteImageFile = await this.#_prisma.product.findFirst({where:{id:id}});
      for (let photo of deleteImageFile.image_urls) {
        await this.#_minio
          .removeFile({ fileName: photo })
          .catch((undefined) => undefined);
      }
      await this.#_prisma.product.delete({where:{id:id}});
      
    }
  
    async #_checkExistingProduct(title: string): Promise<void> {
      const product = await this.#_prisma.product.findFirst({
        where:{title:title}
      });
  
      if (product) {
        throw new ConflictException(`${product.title} is already available`);
      }
    }
  
    async #_checkCategory(id: string): Promise<void> {
      await this.#_checkId(id)
      const category = await this.#_prisma.category.findFirst({where:{id:id}});
  
      if (!category) {
        throw new ConflictException(`Category with ${id} is not exists`);
      }
    }
  
    async #_checkProduct(id: string): Promise<void> {
      await this.#_checkId(id)
      const product = await this.#_prisma.product.findFirst({where:{id:id}});
  
      if (!product) {
        throw new ConflictException(`Product with ${id} is not exists`);
      }
    }
  
    async #_checkProperty(id: string): Promise<void> {
      await this.#_checkId(id)
      const property = await this.#_prisma.properties.findFirst({where:{id:id}});
  
      if (!property) {
        throw new ConflictException(`Property with ${id} is not exists`);
      }
    }
  
    async #_checkPropertyOnProduct(id: string): Promise<void> {
      await this.#_checkId(id)
      const property = await this.#_prisma.propertiesOnProduct.findFirst({where:{id:id}});
  
      if (!property) {
        throw new ConflictException(`PropertyOnProduct with ${id} is not exists`);
      }
    }
  
    async checkTranslate(id: string): Promise<void> {
      const translate = await this.#_prisma.translate.findFirst({where:{id:id}});
  
      if (!translate) {
        throw new ConflictException(`Translate with ${id} is not exists`);
      }
    }

    async #_checkId(id: string): Promise<void> {      
      if (id) {
        if(id.length!=36){
          throw new UnprocessableEntityException(`Invalid ${id} UUID`);
        }
      }
      else{
        throw new UnprocessableEntityException(`Invalid ${id} UUID`);
      }
    }
  
    async #_checkLanguage(code: string): Promise<void> {
      const language = await this.#_prisma.language.findFirst({
        where:{code:code}
      });
  
      if (!language) {
        throw new ConflictException(`${code} is not available`);
      }
    }

    async #_getSingleProductForAdmin(data: any[], languageCode: string): Promise<Product[]> {
      const result: Product[] = [];
      for (const x of data) {
        const title_request = {
          translateId: x.title.toString(),
          languageCode: languageCode,
        };
    
        const desription_request = {
          translateId: x.description.toString(),
          languageCode: languageCode,
        };
    
        const translated_title = await this.#_translate.getSingleTranslate(title_request);
        const translated_description = await this.#_translate.getSingleTranslate(desription_request);
    
        const propertiesOnProduct = [];
        for (const value of x.properties_on_product) {
          const value_request = {
            translateId: value.value.toString(),
            languageCode: languageCode,
          };
    
          const translated_value = await this.#_translate.getSingleTranslate(value_request);
    
          const property_on_product: any = {};
          property_on_product.id = value.id;
          property_on_product.key = (await this.#_translate.getSingleTranslate({ translateId: value.properties.name, languageCode: languageCode })).value;
          property_on_product.value = translated_value.value;
    
          propertiesOnProduct.push(property_on_product);
        }
        const product:any = {}
        product.id = x.id,
        product.title = translated_title.value,
        product.description = translated_description.value,
        product.image_urls = x.image_urls,
        product.price = x.price,
        product.count = x.count,
        product.category_id = x.category_id,
        product.createdBy = x.createdBy,
        product.video_url = x.video_url,
        product.status = x.status,
        product.properties = propertiesOnProduct,
    
        result.push(product);
      }
      return result;
}
}