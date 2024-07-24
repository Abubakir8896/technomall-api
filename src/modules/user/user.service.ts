import {
  BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException
  } from '@nestjs/common';
  import { PrismaService } from '../../prisma';
  import { TranslateService } from '../translate/translate.service';
  import { Properties, User } from '@prisma/client';
import { CreateUserInterface, UpdateUserInterface } from './interfaces';
import { MinioService } from '../../client';
import { ProductService } from '../product/product.service';
import * as bcrypt from 'bcrypt'
import { isArray, isUUID } from 'class-validator';
  
  @Injectable()
  export class UserService {
      #_prisma: PrismaService;
      #_service: TranslateService;
      #_minio: MinioService;
      #_product: ProductService;
    
      constructor(prisma: PrismaService, service:TranslateService, minio: MinioService, product: ProductService) {
        this.#_prisma = prisma;
        this.#_service = service;
        this.#_minio = minio;
        this.#_product = product;
      }
  
     async createUser(payload: CreateUserInterface, userId: string): Promise<void> {
      await this.#_checkExistingUser(payload.phone);
      await this.#_checkRoles(payload.roles);
        let image = ''
        let hashed_password = ''
        let address = ''
        let newUser:any = {}        

        const foundedUser = await this.#_prisma.user.findFirst({where:{phone:payload.phone}})
        if(foundedUser){
          throw new BadRequestException("There is a user with this phone number")
        }

        if(payload.address){
          address = payload.address
        }

        if(payload.password){
          hashed_password = await bcrypt.hash(payload.password, 7)
        }

        if(payload.image){
          const file = await this.#_minio.uploadFile({
            file: payload.image,
            bucket: 'shop',
          });
          image = file.fileName
        }
        if(payload.role){
          newUser = await this.#_prisma.user.create({
              data: {
                  first_name: payload.first_name,
                  last_name: payload.last_name,
                  email: payload.email,
                  phone: payload.phone,
                  address: address,
                  password: hashed_password,
                  image:image,
                  role_type: payload.role
              }})
        }else{
          newUser = await this.#_prisma.user.create({
              data: {
                  first_name: payload.first_name,
                  last_name: payload.last_name,
                  email: payload.email,
                  phone: payload.phone,
                  address: address,
                  password: hashed_password,
                  image:image,
              },
                })
        }    
        for (const role of JSON.parse(payload.roles.toString())) {          
          await this.#_prisma.userOnRole.create({
            data: {
              assignedBy: "59cba6e1-5f2a-4675-9481-0f2dfdf93033",
              roleId: role,
              userId: newUser.id,
            },
          });
        }
    }
  
  async getUserList(): Promise<any[]> {
    const response = [];
    const data = await this.#_prisma.user.findMany();
    for (const user of data) {
      const roles = await this.#_prisma.userOnRole.findMany({
        where: {
          userId: user.id,
        },
        select: {
          role: {
            select: {
              name: true,
            },
          },
        },
      });

      const devices = await this.#_prisma.userDevice.findMany({
        where: {
          userId: user.id,
        },
        select: {
          id: true,
          ip: true,
          name: true,
          model: true,
          version: true,
        },
      });

      response.push({
        ...user,
        roles,
        devices,
      });
    }
    return response;
  }

  async getSingleUser(id: string): Promise<any> {
    const user = await this.#_prisma.user.findFirst({ where: { id: id } });

    if (!user) throw new NotFoundException('User not found');

    const roles = await this.#_prisma.userOnRole.findMany({
      where: {
        userId: user.id,
      },
      select: {
        role: true,
      },
    });

    const devices = await this.#_prisma.userDevice.findMany({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        ip: true,
        name: true,
        model: true,
        version: true,
      },
    });

    return {
      ...user,
      roles,
      devices,
    };
  }

  async getSingleUserByUserID(id: string): Promise<User> {
    const user = await this.#_prisma.user.findFirst({ where: { id: id } });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async updateUser(payload: UpdateUserInterface, userId: string): Promise<void> {
    await this.#_checkUser(payload.id);
    if(payload.first_name){
      await this.#_prisma.user.update({
        where:{ id: payload.id },
        data:{
          first_name: payload.first_name,
        },
        });
      }
    if(payload.last_name){
      await this.#_prisma.user.update({
        where:{ id: payload.id },
        data:{
          last_name: payload.last_name,
        },
        });
      }
      const userRoles = [];

      if (!isArray(payload.roles) && payload?.roles) {
        userRoles.push(payload.roles);
      }
  
      if (isArray(payload?.roles)) {
        userRoles.push(...payload.roles);
      }
  
      const foundedUser = await this.#_prisma.user.findFirst({
        where: { id: payload.id },
      });
  
      if (!foundedUser) {
        throw new NotFoundException('User not found');
      }
  

      if (userRoles.length) {
        await this.#_checkRoles(userRoles);
        await this.#_prisma.userOnRole.deleteMany({
          where: { userId: foundedUser.id },
        });
        for (const role of userRoles) {
          await this.#_prisma.userOnRole.create({
            data: {
              assignedBy: userId,
              roleId: role,
              userId: foundedUser.id,
            },
          });
        }
      }
    if(payload.phone){
      await this.#_prisma.user.update({
        where:{ id: payload.id },
        data:{
          phone: payload.phone,
        },
        });
      }
    if(payload.address){
      await this.#_prisma.user.update({
        where:{ id: payload.id },
        data:{
          address : payload.address,
        },
        });
      }
    if(payload.email){
      await this.#_prisma.user.update({
        where:{ id: payload.id },
        data:{
          email : payload.email,
        },
        });
      }
    if(payload.address){
      await this.#_prisma.user.update({
        where:{ id: payload.id },
        data:{
          address : payload.address,
        },
        });
      }
    if(payload.password){
    const hashed_password = await bcrypt.hash(payload.password, 7)
      await this.#_prisma.user.update(
       { where:{id:payload.id},
        data:{
          password:hashed_password
        }}
      )
    }
    if(payload.image){
      const foundedProduct = await this.#_prisma.user.findFirst({where:{id:payload.id}});
      if(foundedProduct.image.length){
        await this.#_minio
        .removeFile({ fileName: foundedProduct.image })
        .catch((undefined) => undefined);
      }
      const imageUrl = await this.#_minio.uploadFile({
        file: payload.image,
        bucket: 'shop',
      });

      await this.#_prisma.user.update(
        { where:{id:payload.id},
         data:{
           image:imageUrl.fileName
         }}
       )
    }
  }
  
    async deleteUser(id: string): Promise<void> {
      await this.#_checkUser(id);
      const foundedUser = await this.#_prisma.user.findFirst({where:{id:id}});
      if(foundedUser.image.length){
        await this.#_minio
        .removeFile({ fileName: foundedUser.image })
        .catch((undefined) => undefined);
      }
      await this.#_prisma.userOnRole.deleteMany({
        where: { userId: foundedUser.id },
      });
      await this.#_prisma.userDevice.deleteMany({
        where: { userId: foundedUser.id },
      });
      await this.#_prisma.user.delete({ where:{id: id} });
    }
  
    async #_checkUser(id: string): Promise<void> {
      const user = await this.#_prisma.user.findFirst({where:{id:id}});
  
      if (!user) {
        throw new ConflictException(`User with ${id} is not exists`);
      }
    }
  
    async checkTranslate(id: string): Promise<void> {
      const translate = await this.#_prisma.translate.findFirst({where:{id:id}});
  
      if (!translate) {
        throw new ConflictException(`Translate with ${id} is not exists`);
      }
    }

    async #_checkExistingUser(phone: string): Promise<void> {
      const user = await this.#_prisma.user.findFirst({ where: { phone } });
      if (user) {
        throw new ConflictException(`User ${phone} already exists`);
      }
    }
  
    async #_checkRoles(roles: string[]): Promise<void> {
      console.log(roles);
      
      for (const role of JSON.parse(roles.toString())) {        
        const foundedRole = await this.#_prisma.role.findFirst({
          where: { id: role },
        });
        if (!foundedRole) {
          throw new NotFoundException(`Role ${role} not found`);
        }
      }
    }
  }
  