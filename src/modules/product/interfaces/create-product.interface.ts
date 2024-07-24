export declare interface CreatePropertiesOnProductInterface{
    property_id:string;
    value:object;
}

export declare interface CreateProductInterface {
    title: object;
    description: object;
    properties:CreatePropertiesOnProductInterface[]
    price: number;
    count: number;
    createdBy:string
    category_id: string;
    images: any;
    video?:any
}