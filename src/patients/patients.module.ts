import { Module } from '@nestjs/common';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { Patient } from './entities/patient.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [PatientsController],
  providers: [PatientsService],
  imports: [TypeOrmModule.forFeature([Patient])],
  exports: [PatientsService],
})
export class PatientsModule {}
