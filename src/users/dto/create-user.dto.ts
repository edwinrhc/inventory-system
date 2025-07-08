import { Role } from '../role.enum';
import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';


export class CreateUserDto {

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @IsString()
  @MinLength(6)
  @MaxLength(32)
  password: string;

  @IsEnum(Role)
  role: Role;

}
