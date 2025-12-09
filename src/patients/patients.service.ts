import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
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
    const existingIdentifier = await this.patientsRepository.findOne({
      where: { identifier: createPatientDto.identifier },
    });

    if (existingIdentifier) {
      throw new ConflictException(
        `Ya existe un paciente con el DNI/NIE: ${createPatientDto.identifier}`,
      );
    }
    try {
      const patient = this.patientsRepository.create(createPatientDto);
      return await this.patientsRepository.save(patient);
    } catch (error) {
      console.error('Error al crear paciente:', error);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === '23505') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        if (error.constraint && error.constraint.includes('identifier')) {
          throw new ConflictException('Ya existe un paciente con ese DNI/NIE');
        }
        throw new ConflictException('Ya existe un paciente con esos datos');
      }

      throw new InternalServerErrorException(
        'Error al crear el paciente. Inténtalo de nuevo.',
      );
    }
  }

  findAllPatients(): Promise<Patient[]> {
    return this.patientsRepository.find({
      where: { status: 'active' },
      order: { createdAt: 'DESC' },
    });
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
    try {
      const patient = await this.patientsRepository.findOne({
        where: { id },
      });

      if (!patient) {
        throw new NotFoundException(`Paciente con ID ${id} no encontrado`);
      }
      patient.status = 'inactive';
      patient.discharge_date = new Date();
      patient.discharge_reason = 'Eliminado por el usuario';

      await this.patientsRepository.save(patient);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === '23503') {
        throw new BadRequestException(
          'No se puede eliminar el paciente porque tiene información relacionada (citas, diagnósticos, sesiones, etc.)',
        );
      }
      throw error;
    }
  }
}
