import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
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
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
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
