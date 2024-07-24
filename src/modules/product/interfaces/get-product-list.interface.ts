export declare interface GetProductList{
    languageCode: string;
    page?: number;
    limit?:number
}

export declare interface getProductResponse {
    id: string;
    title: string, 
    description: string 
    price: number 
    count: number
    category_id: string
    image_urls: string[] 
    video_url: string
    createdAt: Date
    createdBy: string
    properties: object[]
}