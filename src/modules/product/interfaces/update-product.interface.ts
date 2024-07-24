export declare interface UpdatePropertiesOnProductInterface{
  property_id:string
  value:object;
}


export declare interface UpdateProductRequest {
    id: string;
    title?: object;
    description?: object;
    properties?:UpdatePropertiesOnProductInterface
    price?: number;
    count?: number;
    status: 'active' | 'inactive'
  }
  