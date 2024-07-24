import { IsEmail, IsPhoneNumber, IsString, Matches } from "class-validator";
import { LoginGetSMSCodeRequest } from "../interfaces";
import { ApiProperty } from "@nestjs/swagger";

export class LoginGetSMSDto implements LoginGetSMSCodeRequest {
  @ApiProperty()
  @IsString()
  @IsEmail()
  email: string;
}