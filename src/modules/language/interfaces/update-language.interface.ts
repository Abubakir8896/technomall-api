import { FileType } from "../../category/interfaces";

export declare interface UpdateLanguageRequest {
    id: string;
    title: string;
    image?:FileType;   
  }