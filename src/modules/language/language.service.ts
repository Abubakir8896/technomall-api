import { CreateLanguageRequest, UpdateLanguageRequest } from './interfaces';
import { BadRequestException, ConflictException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { PrismaService } from '../../prisma';
import { Language } from '@prisma/client';
import { MinioService } from '../../client';

@Injectable()
export class LanguageService {
  #_prisma: PrismaService;
  #_minio: MinioService;

  constructor(prisma: PrismaService, minio: MinioService) {
    this.#_prisma = prisma;
    this.#_minio = minio;
  }

  async createLanguage(payload: CreateLanguageRequest): Promise<void> {
    await this.#_checkExistingLanguage(payload.code);
    if(!payload.image){
      throw new BadRequestException("Image should be not Empty")
    }

    const file = await this.#_minio.uploadFile({
      file: payload.image,
      bucket: 'shop',
    });

    await this.#_prisma.language.create({
      data: {
        code: payload.code,
        title: payload.title,
        image_url: file.fileName
      },
    });
  }

  async getLanguageList(): Promise<Language[]> {
    return await this.#_prisma.language.findMany();
  }

  async updateLanguage(payload: UpdateLanguageRequest): Promise<void> {
    await this.#_checkLanguage(payload.id);
    const foundedImage = await this.#_prisma.language.findFirst({where:{ id: payload.id }})

    if(payload.image){
      await this.#_minio.removeFile({ fileName: foundedImage.image_url }).catch(undefined => undefined);
      const file = await this.#_minio.uploadFile({
        file: payload.image,
        bucket: 'shop',
      });
      await this.#_prisma.language.update({
        where:{ id: payload.id },
        data:{image_url: file.fileName}}
      );
    }

    if(payload.title){
      await this.#_prisma.language.update({
        data: { title: payload.title },
        where: { id: payload.id },
      });
    }
  }

  async deleteLanguage(id: string): Promise<void> {
    await this.#_checkLanguage(id);
    const deletedImage = await this.#_prisma.language.findFirst({where:{ id:id }})

    await this.#_minio.removeFile({ fileName: deletedImage.image_url }).catch(undefined => undefined);

    await this.#_prisma.language.delete({ where: { id } });
  }

  async #_checkExistingLanguage(code: string): Promise<void> {
    const language = await this.#_prisma.language.findFirst({
      where: {
        code
      },
    });

    if (language) {
      throw new ConflictException(`${language.title} is already available`);
    }
  }

  async #_checkLanguage(id: string): Promise<void> {
    await this.#_checkId(id)
    const language = await this.#_prisma.language.findFirst({
      where: {
        id,
      },
    });

    if (!language) {
      throw new ConflictException(`Language with ${id} is not exists`);
    }
  }

  async #_checkId(id: string): Promise<void>{
    const isValid = isUUID(id, 4)
    if(!isValid){
      throw new UnprocessableEntityException(`Invalid ${id} id`)
    }
  }
}