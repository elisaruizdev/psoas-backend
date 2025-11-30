import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { Session } from './entities/session.entity';
import { PatientsModule } from '../patients/patients.module';
import { PhysiosModule } from '../physios/physios.module';
import { TreatmentsModule } from '../treatments/treatments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Session]),
    PatientsModule,
    PhysiosModule,
    TreatmentsModule,
  ],
  controllers: [SessionsController],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
