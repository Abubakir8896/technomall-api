import {
    ConflictException,
    Injectable
  } from '@nestjs/common';
import { Model } from '@prisma/client';
  import { PrismaService } from '../../prisma';
import { CreateModelDto, UpdateModelDto } from './dtos';
import { UpdateModelInterface } from './interfaces';
  
  @Injectable()
  export class ModelService {
      #_prisma: PrismaService;
    
      constructor(prisma: PrismaService) {
        this.#_prisma = prisma;
      }
  
    async createModel(payload: CreateModelDto): Promise<void> {
      await this.#_checkExistingModel(payload.name);    
      await this.#_prisma.model.create({
          data: {
              name: payload.name
          },
            });
    }
  
    async getSingleModel(id:string): Promise<Model[]> {
      await this.#_checkModel(id)
      const data = await this.#_prisma.model.findMany()
      return data
    }
  
    async getModelList (): Promise<Model[]> {
      const data = await this.#_prisma.model.findMany()
      return data
  }
  
    async updateModel(payload: UpdateModelInterface): Promise<void> {
      await this.#_checkModel(payload.id);    
      if(payload.name){
        await this.#_checkExistingModel(payload.name);
        await this.#_prisma.model.update({
          where:{id:payload.id}, 
          data:{name:payload.name
          }})
        }
      }
      
    async deleteModel(id: string): Promise<void> {
        await this.#_checkModel(id)
        await this.#_prisma.model.delete({ where:{id: id} });
    }
  
    async #_checkModel(id: string): Promise<void> {
      const model = await this.#_prisma.model.findFirst({where:{id:id}});
  
      if (!model) {
        throw new ConflictException(`Model with ${id} is not exists`);
      }
    }
  
    async #_checkExistingModel(name: string): Promise<void> {
      const model = await this.#_prisma.model.findFirst({where:{name: name}});
  
      if (model) {
        throw new ConflictException(`Model with ${name} is already exists`);
      }
    }
  }
  