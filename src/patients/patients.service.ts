import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
  ) {}

  findAllPatients(): Promise<Patient[]> {
    return this.patientsRepository.find();
  }

  async findOnePatient(id: number): Promise<Patient> {
    const patient = await this.patientsRepository.findOne({
      where: { id_patient: id },
    });

    if (!patient) {
      throw new NotFoundException(`Paciente no encontrado`);
    }
    return patient;
  }
}
