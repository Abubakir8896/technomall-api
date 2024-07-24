import {
    ConflictException,
    Injectable
  } from '@nestjs/common';
import { Model, Permission } from '@prisma/client';
  import { PrismaService } from '../../prisma';
import { UpdateModelInterface } from '../model/interfaces';
import { ModelService } from '../model/model.service';
import { UpdatePermissionDto } from './dtos';
import { CreatePermissionInterface, UpdatePermissionInterface } from './interfaces';
  
  @Injectable()
  export class PermissionService {
      #_prisma: PrismaService;
      #_model: ModelService;
    
      constructor(prisma: PrismaService, model: ModelService) {
        this.#_prisma = prisma;
        this.#_model = model
      }
  
    async createPermission(payload: CreatePermissionInterface): Promise<void> {
      await this.#_checkExistingPermission(payload.name);
      await this.#_checkModel(payload.model_id)    
      await this.#_prisma.permission.create({
          data: {
              name: payload.name,
              model_id: payload.model_id,
              code: payload.code
          },
            });
    }
  
    async getSinglePermission(id:string): Promise<Permission[]> {
      await this.#_checkPermission(id)
      const data = await this.#_prisma.permission.findMany()
      return data
    }
  
    async getPermissionList (): Promise<Permission[]> {
      const data = await this.#_prisma.permission.findMany()
      return data
  }
  
    async updatePermission(payload: UpdatePermissionInterface): Promise<void> {
      if(payload.name){
        await this.#_checkExistingPermission(payload.name);
        await this.#_prisma.model.update({
          where:{id:payload.id}, 
          data:{name:payload.name
          }})
        }
      }
      
    async deletePermission(id: string): Promise<void> {
        await this.#_checkPermission(id)
        await this.#_prisma.permission.delete({ where:{id: id} });
    }
  
    async #_checkPermission(id: string): Promise<void> {
      const permission = await this.#_prisma.permission.findFirst({where:{id:id}});
  
      if (!permission) {
        throw new ConflictException(`Permission with ${id} is not exists`);
      }
    }
  
    async #_checkModel(id: string): Promise<void> {
      const model = await this.#_prisma.model.findFirst({where:{id:id}});
  
      if (!model) {
        throw new ConflictException(`Model with ${id} is not exists`);
      }
    }
  
    async #_checkExistingPermission(name: string): Promise<void> {
      const permission = await this.#_prisma.permission.findFirst({where:{name: name}});
  
      if (permission) {
        throw new ConflictException(`Permission with ${name} is already exists`);
      }
    }
  }
  