import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Repository, LessThan, MoreThan } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/appointment/appointment.dto';
import { UpdateAppointmentDto } from './dto/appointment/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
  ) {}

  async create(
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appointment> {
    const appointmentDate = new Date(createAppointmentDto.appointment_date);
    const duration = createAppointmentDto.duration || 60;
    const appointmentEnd = new Date(
      appointmentDate.getTime() + duration * 60000,
    );

    await this.checkAvailability(
      createAppointmentDto.physio_id,
      appointmentDate,
      appointmentEnd,
    );

    const sessionCount = await this.appointmentsRepository.count({
      where: { patient_id: createAppointmentDto.patient_id },
    });

    const sessionNumber = sessionCount + 1;

    const appointment = this.appointmentsRepository.create({
      ...createAppointmentDto,
      session_number: sessionNumber,
      duration: duration,
    });

    return await this.appointmentsRepository.save(appointment);
  }

  async findAll(): Promise<Appointment[]> {
    return await this.appointmentsRepository.find({
      relations: ['patient', 'physio'],
      order: { appointment_date: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id },
      relations: ['patient', 'physio'],
    });

    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }

    return appointment;
  }

  async update(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<Appointment> {
    const appointment = await this.findOne(id);

    if (updateAppointmentDto.appointment_date) {
      const appointmentDate = new Date(updateAppointmentDto.appointment_date);
      const duration = updateAppointmentDto.duration || appointment.duration;
      const appointmentEnd = new Date(
        appointmentDate.getTime() + duration * 60000,
      );

      await this.checkAvailability(
        appointment.physio_id,
        appointmentDate,
        appointmentEnd,
        id,
      );
    }

    Object.assign(appointment, updateAppointmentDto);

    return await this.appointmentsRepository.save(appointment);
  }

  async cancel(id: string): Promise<Appointment> {
    const appointment = await this.findOne(id);
    appointment.status = 'cancelled';
    return await this.appointmentsRepository.save(appointment);
  }

  async remove(id: string): Promise<any> {
    const appointment = await this.findOne(id);
    await this.appointmentsRepository.remove(appointment);
    return { message: 'Cita eliminada correctamente' };
  }

  private async checkAvailability(
    physio_id: number,
    appointmentStart: Date,
    appointmentEnd: Date,
    excludeAppointmentId?: string,
  ): Promise<void> {
    const queryBuilder = this.appointmentsRepository
      .createQueryBuilder('appointment')
      .where('appointment.physio_id = :physio_id', { physio_id })
      .andWhere('appointment.status != :status', { status: 'cancelled' })
      .andWhere(
        '(appointment.appointment_date < :end AND ' +
          "appointment.appointment_date + (appointment.duration || ' minutes')::interval > :start)",
        {
          start: appointmentStart,
          end: appointmentEnd,
        },
      );

    if (excludeAppointmentId) {
      queryBuilder.andWhere('appointment.id != :id', {
        id: excludeAppointmentId,
      });
    }

    const conflictingAppointment = await queryBuilder.getOne();

    if (conflictingAppointment) {
      throw new ConflictException(
        'El fisioterapeuta ya tiene una cita en ese horario',
      );
    }
  }
}
