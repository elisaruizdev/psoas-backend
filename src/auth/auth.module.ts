/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Physios } from '../physios/entities/physios.entity';
import { EmailModule } from '../email/email.module';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Physios]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const secret = configService.get<string>('JWT_SECRET');
        // Sin secreto no se arranca: firmar con uno vacío dejaría falsificar cualquier token.
        if (!secret) {
          throw new Error(
            'Falta JWT_SECRET: el backend no puede firmar ni verificar tokens',
          );
        }
        return {
          secret,
          signOptions: {
            algorithm: 'HS256',
            expiresIn: (configService.get<string>('JWT_EXPIRATION') ||
              '7d') as any,
          },
        };
      },
      inject: [ConfigService],
    }),
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    // Guard global: todas las rutas de la app exigen token salvo las marcadas con @Public().
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
  exports: [AuthService],
})
export class AuthModule {}
