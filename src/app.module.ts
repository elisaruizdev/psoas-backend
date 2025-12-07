import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PatientsModule } from './patients/patients.module';
import { PhysiosModule } from './physios/physios.module';
import { AuthModule } from './auth/auth.module';
import { AppointmentsModule } from './appointment/appointments.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DiagnosesModule } from './diagnoses/diagnoses.module';
import { TreatmentsModule } from './treatments/treatments.module';
import { SessionsModule } from './sessions/sessions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],

      inject: [ConfigService],

      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const isProduction =
          configService.get<string>('NODE_ENV') === 'production';
        const useUrl = !!databaseUrl;

        return {
          type: 'postgres',
          url: useUrl ? databaseUrl : undefined,
          host: !useUrl ? configService.get<string>('DB_HOST') : undefined,
          port: !useUrl ? configService.get<number>('DB_PORT') : undefined,
          username: !useUrl
            ? configService.get<string>('DB_USERNAME')
            : undefined,
          password: !useUrl
            ? configService.get<string>('DB_PASSWORD')
            : undefined,
          database: !useUrl
            ? configService.get<string>('DB_DATABASE')
            : undefined,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
          ssl: isProduction ? { rejectUnauthorized: false } : false,
        };
      },
    }),
    PatientsModule,
    PhysiosModule,
    AuthModule,
    AppointmentsModule,
    DashboardModule,
    DiagnosesModule,
    TreatmentsModule,
    SessionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
