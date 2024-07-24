import { ApiProperty } from "@nestjs/swagger"
import { DeleteProductVideoInterface } from "../interfaces";

export class DeleteProductVideoDto implements DeleteProductVideoInterface {
  @ApiProperty()
  productId: string;

  @ApiProperty()
  video_url: string;
}