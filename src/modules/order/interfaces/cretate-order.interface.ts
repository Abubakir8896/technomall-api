export declare interface CreateOrderItemInterface {
    quantity: number;
    product_id: string
}

export declare interface CreateOrderInterface {
    orderItem: CreateOrderItemInterface[]
    customer_id: string
    shop_id: string
}
  