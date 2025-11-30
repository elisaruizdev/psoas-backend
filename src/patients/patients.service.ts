import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { Repository } from 'typeorm';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

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

  async update(
    id: string,
    updatePatientDto: UpdatePatientDto,
  ): Promise<Patient> {
    const patient = await this.findOne(id);
    if (
      updatePatientDto.identifier &&
      updatePatientDto.identifier !== patient.identifier
    ) {
      const existingWithIdentifier = await this.patientsRepository.findOne({
        where: { identifier: updatePatientDto.identifier },
      });

      if (existingWithIdentifier) {
        throw new ConflictException('Ya existe un paciente con ese DNI/NIE');
      }
    }

    if (updatePatientDto.email && updatePatientDto.email !== patient.email) {
      const existingWithEmail = await this.patientsRepository.findOne({
        where: { email: updatePatientDto.email },
      });

      if (existingWithEmail) {
        throw new ConflictException('Ya existe un paciente con ese email');
      }
    }
    if (
      updatePatientDto.status === 'inactive' &&
      !updatePatientDto.discharge_reason
    ) {
      throw new ConflictException(
        'Debe proporcionar una razón de alta al marcar el paciente como inactivo',
      );
    }

    if (updatePatientDto.status === 'inactive') {
      updatePatientDto['discharge_date'] = new Date();
    }

    await this.patientsRepository.update(id, updatePatientDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const patient = await this.findOne(id);
    await this.patientsRepository.remove(patient);
  }
}
