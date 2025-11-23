import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { Repository } from 'typeorm';
import { CreatePatientDto } from './dto/create-patient/create-patient.dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
  ) {}

  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    const existingPatient = await this.patientsRepository.findOne({
      where: { identifier: createPatientDto.identifier },
    });

    if (existingPatient) {
      throw new ConflictException('Ya existe un paciente con ese DNI/NIE');
    }

    const patient = this.patientsRepository.create(createPatientDto);
    const saved = await this.patientsRepository.save(patient);
    return saved;
  }

  findAllPatients(): Promise<Patient[]> {
    return this.patientsRepository.find();
  }

  async findOne(id: string): Promise<Patient> {
    const patient = await this.patientsRepository.findOne({
      where: { id },
    });

    if (!patient) {
      throw new NotFoundException('Paciente no encontrado');
    }

    return patient;
  }
}
