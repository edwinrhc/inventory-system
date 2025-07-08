import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Roles } from './roles.decorator';
import { Role } from 'src/users/role.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './roles.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from '../users/dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Sólo ADMIN puede registrar nuevos usuarios
  @Post('register')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  register(@Body() dto: CreateUserDto) {
    return this.authService['usersService'].create(dto);
  }

  // Login público
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // Ejemplo de endpoint protegido para ADMIN y VENDOR
  @Post('protected')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.VENDOR)
  protected(@Request() req) {
    return { msg: `Hola ${req.user.userId}, tu rol es ${req.user.role}` };
  }
}
