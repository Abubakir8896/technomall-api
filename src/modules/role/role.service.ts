import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoleRequest, UpdateRoleRequest } from './interfaces';
import { Role } from '@prisma/client';
import { isUUID } from 'class-validator';

@Injectable()
export class Roleservice {
  #_prisma: PrismaService;

  constructor(prisma: PrismaService) {
    this.#_prisma = prisma;
  }

  async createRole(payload: CreateRoleRequest): Promise<void> {
    await this.#_checkPermissions(payload.permissions);
    await this.#_prisma.role.create({
      data: {
        name: payload.name,
        permissions: {
          set: payload.permissions,
        },
        role_type: payload.role
      },
    });
  }

  async getRoleList(): Promise<Role[]> {
    const response = [];
    const data = await this.#_prisma.role.findMany();
    for (const el of data) {
      const permissions = [];
      const models = [];
      for (const p of el.permissions) {
        const permission = await this.#_prisma.permission.findFirst({
          where: { id: p },
          include: {
            model: true,
          },
        });
        if (permission) {
          if (!models.includes(permission.model_id))
            models.push(permission.model_id);
          permissions.push(permission);
        }
      }

      const roleModels = [];

      for (const m of models) {
        const model = await this.#_prisma.model.findFirst({
          where: { id: m },
        });
        if (model) {
          roleModels.push({
            id: model.id,
            name: model.name,
            permissions: [],
          });
        }
      }

      for (const p of permissions) {
        const foundedModel = roleModels.find((e) => e.id == p.modelId);
        if (foundedModel) {
          foundedModel.permissions.push({
            id: p.id,
            name: p.name,
          });
        }
      }

      response.push({
        id: el.id,
        name: el.name,
        permissions: roleModels,
      });
    }

    return response;
  }

  async updateRole(payload: UpdateRoleRequest): Promise<void> {
    this.#_checkUUID(payload.id)
    const foundedRole = await this.#_prisma.role.findFirst({where: {id: payload.id}})

    if(!foundedRole){
      throw new NotFoundException("Role not found")
    }
    if (payload?.permissions?.length) {
      await this.#_checkPermissions(payload.permissions);

      await this.#_prisma.role.update({
        where: { id: payload.id },
        data: {
          permissions: {
            set: payload.permissions,
          },
        },
      });
    }
    await this.#_prisma.role.update({
      where: { id: payload.id },
      data: {
        name: payload.name,
      },
    });
  }

  async deleteRole(id: string): Promise<void> {
    this.#_checkUUID(id)
    await this.#_prisma.role.delete({ where: { id } });
  }

  #_checkUUID(id: string): void{
    if(!isUUID(id, 4)){
      throw new ConflictException("Please provide a valid UUID")
    }
  }

  async #_checkPermissions(payload: string[]): Promise<void> {
    for (const per of payload) {
      const permission = await this.#_prisma.permission.findFirst({
        where: { id: per },
      });
      if (!permission) throw new NotFoundException('Permission not found');
    }
  }
}