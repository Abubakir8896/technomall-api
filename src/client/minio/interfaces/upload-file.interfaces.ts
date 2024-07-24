
declare interface FileInterface {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export declare interface UploadFileRequest {
  file: FileInterface;
  bucket: string;
}

export declare interface UploadFileResponse {
  etag: string;
  fileName: string;
}
