export declare interface FileType{
    fieldname:string
    originalname:string
    encoding:string
    mimetype: string
    buffer:Buffer
    size:number
  }

export declare interface CreateCategoryInterface {
    name: string;
    image?: FileType;
    category_id?: string;
    shop_id: string;
  }
  