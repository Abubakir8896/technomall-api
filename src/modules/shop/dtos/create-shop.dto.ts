import { IsPhoneNumber, IsString, IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { CreateShopRequest } from "../interfaces";

export class CreateShopDto implements CreateShopRequest {
  @ApiProperty({example:"Helo"})
  @IsString()
  name: string;

  @ApiProperty()
  @IsPhoneNumber("UZ")
  phone: string
}