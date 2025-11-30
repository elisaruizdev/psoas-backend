import {
  Injectable,
  NotFoundException,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Diagnosis } from './entities/diagnosis.entity';
import { CreateDiagnosisDto } from './dto/create-diagnosis.dto';
import { UpdateDiagnosisDto } from './dto/update-diagnosis.dto';
import { PatientsService } from '../patients/patients.service';

@Injectable()
export class DiagnosesService {
  constructor(
    @InjectRepository(Diagnosis)
    private diagnosesRepository: Repository<Diagnosis>,
    private patientsService: PatientsService,
  ) {}

  async create(createDiagnosisDto: CreateDiagnosisDto): Promise<Diagnosis> {
    await this.patientsService.findOne(createDiagnosisDto.patient_id);

    const diagnosis = this.diagnosesRepository.create(createDiagnosisDto);
    return await this.diagnosesRepository.save(diagnosis);
  }

  async findAllByPatient(patientId: string): Promise<Diagnosis[]> {
    await this.patientsService.findOne(patientId);

    return await this.diagnosesRepository.find({
      where: { patient_id: patientId },
      order: { diagnosis_date: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Diagnosis> {
    const diagnosis = await this.diagnosesRepository.findOne({
      where: { id },
    });

    if (!diagnosis) {
      throw new NotFoundException('Diagnóstico no encontrado');
    }

    return diagnosis;
  }

  async update(
    id: string,
    updateDiagnosisDto: UpdateDiagnosisDto,
  ): Promise<Diagnosis> {
    const diagnosis = await this.findOne(id);

    Object.assign(diagnosis, updateDiagnosisDto);

    return await this.diagnosesRepository.save(diagnosis);
  }

  async remove(id: string): Promise<void> {
    const diagnosis = await this.findOne(id);
    await this.diagnosesRepository.remove(diagnosis);
  }
}
