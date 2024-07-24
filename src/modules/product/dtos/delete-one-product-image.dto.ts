import { ApiProperty } from "@nestjs/swagger"
import { DeleteProductImageInterface } from "../interfaces/delete-one-product-image.interface";

export class DeleteProductImageDto implements DeleteProductImageInterface {
  @ApiProperty()
  productId: string;

  @ApiProperty()
  image_url: string;
}