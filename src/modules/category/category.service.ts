import { CreateCategoryInterface, SearchCategoryInterface, UpdateCategoryInterface } from './interfaces';
import { Category } from '@prisma/client';
import {
  ConflictException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MinioService } from './../../client/minio/minio.service';
import { TranslateService } from '../translate/translate.service';
import { ProductService } from '../product/product.service';

@Injectable()
export class CategoryService {
    #_prisma: PrismaService;
    #_minio: MinioService;
    #_service: TranslateService;
    #_product: ProductService;
  
    constructor(prisma: PrismaService, minio:MinioService, service:TranslateService, product:ProductService) {
      this.#_prisma = prisma;
      this.#_minio = minio;
      this.#_service = service;
      this.#_product = product
    }

  async createCategory(payload: CreateCategoryInterface): Promise<void> {
    await this.checkTranslate(payload.name);    
    await this.#_checkShop(payload.shop_id)
    
    let image = ''

    if(payload.image){
      const file = await this.#_minio.uploadFile({
        file: payload.image,
        bucket: 'shop',
      });
      image = file.fileName
    }


    if (payload.category_id) {
      await this.#_checkCategory(payload.category_id)
      const newCategoriy= await this.#_prisma.category.create({
            data: {
              name: payload.name,
              image_url: image,
              category_id: payload.category_id,
              shop_id: payload.shop_id
            },
          });
    } else {
      const newCategoriy = await this.#_prisma.category.create({data:{
        name: payload.name,
        image_url:image,
        shop_id: payload.shop_id
      }});
    }
  }

  async getSingleCategory(languageCode:string, id:string): Promise<Category> {
    await this.#_checkCategory(id)
    const data = await this.#_prisma.category.findMany({where:{id:id}, include:{subcategories:{include:{product:true}}}})

    const category =  await this.#_getCategoryListForAdmin(data, languageCode)

    return category[0]
  }

  async getCategoryList(languageCode: string): Promise<Category[]> {
    const data = await this.#_prisma.category.findMany({include:{subcategories:{include:{product:true}}}})

    return await this.#_getCategoryListForAdmin(data, languageCode)
}

  async updateCategory(payload: UpdateCategoryInterface): Promise<void> {
    await this.#_checkCategory(payload.id);    
    const updated_category = await this.#_prisma.category.findFirst({where:{id:payload.id}})
    if(payload.category_id){
      await this.#_prisma.category.update({where:{id:payload.id},
         data:{category_id:payload.category_id}})
    }
    if(payload.name){
      await this.checkTranslate(payload.name);
      await this.#_prisma.translate.delete({where:{id:updated_category.name}})
      await this.#_prisma.category.update({
        where:{id:payload.id}, 
        data:{name:payload.name
      }})
    }
    if(payload.image){
      const deleteImageFile = await this.#_prisma.category.findFirst({where:{id:payload.id}});
      await this.#_minio.removeFile({ fileName: deleteImageFile.image_url }).catch(undefined => undefined);
      const file = await this.#_minio.uploadFile({
        file: payload.image,
        bucket: 'shop',
      });
      await this.#_prisma.category.update({
        where:{ id: payload.id },
        data:{image_url: file.fileName}}
      );
    }
  }

  async deleteCategory(id: string): Promise<void> {
    await this.#_checkCategory(id);
    const deleteImageFile = await this.#_prisma.category.findFirst({where:{id:id}});
    if(deleteImageFile.image_url){
      await this.#_minio.removeFile({ fileName: deleteImageFile.image_url }).catch(undefined => undefined);
    }
    await this.#_prisma.category.delete({ where:{id: id} });
  }

  async searchCategory(payload: SearchCategoryInterface): Promise<Category[]> {

    const data = await this.getCategoryList(payload.languageCode);
    
    if (!payload.name.length || !data.length) {
      return data;
    }

    let result = [];
    for (const category of data) {      
      if (
        category.name
          .toString()
          .toLocaleLowerCase()
          .includes(payload.name.toLocaleLowerCase())
      ) {
        
        result.push(category);
      }
    }
    return result;
  }

  async #_checkExistingCategory(name: string): Promise<void> {
    const category = await this.#_prisma.category.findFirst({
    where:{name:name}
    });

    if (category) {
      throw new ConflictException(`${category.name} is already available`);
    }
  }

  async #_checkCategory(id: string): Promise<void> {
    const category = await this.#_prisma.category.findFirst({where:{id:id}});

    if (!category) {
      throw new ConflictException(`Category with ${id} is not exists`);
    }
  }

  async #_checkShop(id: string): Promise<void> {
    const shop = await this.#_prisma.shop.findFirst({where:{id:id}});

    if (!shop) {
      throw new ConflictException(`Shop with ${id} is not exists`);
    }
  }

  async checkTranslate(id: string): Promise<void> {
    const translate = await this.#_prisma.translate.findFirst({where:{id:id}});

    if (!translate) {
      throw new ConflictException(`Translate with ${id} is not exists`);
    }
  }

  async #_getCategoryListForAdmin(data, languageCode): Promise<Category[]>{
    let result = [];

    for (let x of data) {
      let subcategories = [];
      const category: any = {};

      category.id = x.id;
      const category_name = await this.#_service.getSingleTranslate({
        translateId: x.name.toString(),
        languageCode: languageCode,
    })      
    category.name = category_name.value;  
    category.image_url = x.image_url;
    for(const item of x.subcategories){
        let subcategory:any ={}

        subcategory.id = item.id;
        const subcategory_name = await this.#_service.getSingleTranslate({
            translateId: item.name.toString(),
            languageCode: languageCode,
        }) 
        let products = []
        for(const product of item.product){
          products.push(await this.#_product.getSingleProduct(languageCode, product.id))
        }
        subcategory.name = subcategory_name.value;      
        subcategory.image_url = item.image_url;
        subcategory.products = products

        category.subcategories = subcategory
    }    
      result.push(category)
    }
    return result
  }
}
