export declare interface location{
    longitude: string,
    latitude: string
}

export declare interface UpdateShopRequest {
    id: string;
    name?: string;
    phone?: string;
    description?: string;
    location?: location;
    image?: any
  }