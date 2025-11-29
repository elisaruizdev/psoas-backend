import {
  Injectable,
  NotFoundException,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Treatment } from './entities/treatment.entity';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { UpdateTreatmentDto } from './dto/update-treatment.dto';
import { PatientsService } from '../patients/patients.service';

@Injectable()
export class TreatmentsService {
  constructor(
    @InjectRepository(Treatment)
    private treatmentsRepository: Repository<Treatment>,
    private patientsService: PatientsService,
  ) {}

  async create(createTreatmentDto: CreateTreatmentDto): Promise<Treatment> {
    // Verificar que el paciente existe
    await this.patientsService.findOne(createTreatmentDto.patient_id);

    const treatment = this.treatmentsRepository.create(createTreatmentDto);
    return await this.treatmentsRepository.save(treatment);
  }

  async findAllByPatient(patientId: string): Promise<Treatment[]> {
    // Verificar que el paciente existe
    await this.patientsService.findOne(patientId);

    return await this.treatmentsRepository.find({
      where: { patient_id: patientId },
      order: { start_date: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Treatment> {
    const treatment = await this.treatmentsRepository.findOne({
      where: { id },
    });

    if (!treatment) {
      throw new NotFoundException('Tratamiento no encontrado');
    }

    return treatment;
  }

  async update(
    id: string,
    updateTreatmentDto: UpdateTreatmentDto,
  ): Promise<Treatment> {
    const treatment = await this.findOne(id);

    Object.assign(treatment, updateTreatmentDto);

    return await this.treatmentsRepository.save(treatment);
  }

  async remove(id: string): Promise<void> {
    const treatment = await this.findOne(id);
    await this.treatmentsRepository.remove(treatment);
  }
}
