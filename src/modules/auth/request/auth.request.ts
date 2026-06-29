import { IsEmail, IsNotEmpty } from 'class-validator';

export class AuthRequest {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
