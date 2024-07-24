import { ConflictException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';
import {
  RemoveFileRequest,
  UploadFileRequest,
  UploadFileResponse,
} from './interfaces';

@Injectable()
export class MinioService {
  #_client: Client;

  constructor(config: ConfigService) {
    this.#_client = new Client({
      endPoint: config.getOrThrow<string>('minio.endPoint'),
      accessKey: config.getOrThrow<string>('minio.accessKey'),
      secretKey: config.getOrThrow<string>('minio.secretKey'),
      useSSL: config.getOrThrow<boolean>('minio.useSSL'),
    });
  }

  async uploadFile(payload: UploadFileRequest): Promise<UploadFileResponse> {
    
    // Extracting file extension from originalName
    const extension = payload.file.originalname.split('.').at(-1);

    // Generated random UUID
    const randomName = randomUUID();

    // create new file name
    const fileName = randomName.concat('.', extension);

    const res = await this.#_client.putObject(
      payload.bucket,
      fileName,
      payload.file.buffer,
    );

    // Checking is file uploaded successfully or not
    if (!res.etag) {
      throw new ConflictException('File is not uploaded');
    }

    return { etag: res.etag, fileName: payload.bucket.concat('/', fileName) };
  }

  async removeFile(payload: RemoveFileRequest): Promise<any> {
    const bucketName = payload.fileName.split('/')[0];

    const fileName = payload.fileName.split('/')[1];

    await this.#_client.removeObject(bucketName, fileName);
  }
}
