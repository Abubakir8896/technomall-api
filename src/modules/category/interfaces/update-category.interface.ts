import { FileType } from "./create-category.interface";

export declare interface UpdateCategoryInterface {
    id:string
    name?: string;
    image?:FileType    
    category_id?:string
}