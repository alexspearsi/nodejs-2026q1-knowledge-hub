import { IsNotEmpty, IsString } from 'class-validator';

export class SignupRequestDto {
  @IsString()
  @IsNotEmpty()
  login: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
