import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { RolesGuard } from './roles.guard';
import { PassportModule } from '@nestjs/passport';
import { JwtModule }      from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';


@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (cs: ConfigService) => ({
        secret: cs.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: cs.get<string>('JWT_EXPIRES_IN') },
      }),
    }),
    // Módulo de usuarios (exporta UsersService)
    UsersModule,

    // Passport: registra la estrategia 'jwt'
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // JWT: configura el secret y expiración
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
    }),

    // Needed only if JwtStrategy o AuthService hacen @InjectRepository(User)
    TypeOrmModule.forFeature([User]),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    RolesGuard,
  ],
  controllers: [AuthController],
  exports: [
    PassportModule,
    JwtModule,       // exporta JwtModule si otro módulo necesita firmar o validar tokens
  ],
})
export class AuthModule {}
