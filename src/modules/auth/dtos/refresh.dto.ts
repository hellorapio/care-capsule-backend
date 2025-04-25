import { IsJWT, IsNotEmpty, IsString } from "class-validator";

export default class RefreshDTO {
  @IsNotEmpty()
  @IsString()
  @IsJWT()
  refresh: string;
}
