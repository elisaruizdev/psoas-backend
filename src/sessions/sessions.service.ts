import {
  Injectable,
  NotFoundException,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './entities/session.entity';
import { UpdateSessionDto } from './dto/update-session.dto';
import { PatientsService } from '../patients/patients.service';
import { PhysiosService } from '../physios/physios.service';
import { TreatmentsService } from '../treatments/treatments.service';
import { CreateSessionDto } from './dto/create-session.dto';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private sessionsRepository: Repository<Session>,
    private patientsService: PatientsService,
    private physiosService: PhysiosService,
    private treatmentsService: TreatmentsService,
  ) {}

  async create(createSessionDto: CreateSessionDto): Promise<Session> {
    await this.patientsService.findOne(createSessionDto.patient_id);

    await this.physiosService.findOne(createSessionDto.physio_id);

    if (createSessionDto.treatment_id) {
      await this.treatmentsService.findOne(createSessionDto.treatment_id);
    }

    const session = this.sessionsRepository.create(createSessionDto);
    return await this.sessionsRepository.save(session);
  }

  async findAllByPatient(patientId: string): Promise<Session[]> {
    await this.patientsService.findOne(patientId);

    return await this.sessionsRepository.find({
      where: { patient_id: patientId },
      relations: ['physio', 'treatment'],
      order: { session_date: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Session> {
    const session = await this.sessionsRepository.findOne({
      where: { id },
      relations: ['physio', 'treatment'],
    });

    if (!session) {
      throw new NotFoundException('Sesión no encontrada');
    }

    return session;
  }

  async update(
    id: string,
    updateSessionDto: UpdateSessionDto,
  ): Promise<Session> {
    const session = await this.findOne(id);

    if (updateSessionDto.physio_id) {
      await this.physiosService.findOne(updateSessionDto.physio_id);
    }
    if (updateSessionDto.treatment_id) {
      await this.treatmentsService.findOne(updateSessionDto.treatment_id);
    }

    Object.assign(session, updateSessionDto);

    return await this.sessionsRepository.save(session);
  }

  async remove(id: string): Promise<void> {
    const session = await this.findOne(id);
    await this.sessionsRepository.remove(session);
  }
}
