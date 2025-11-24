import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from 'src/appointment/entities/appointment.entity';
import { Between, Repository } from 'typeorm';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
  ) {}

  async getDashboardStats() {
    const today = this.getStartOfDay(new Date());
    const endOfToday = this.getEndOfDay(new Date());
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const [
      totalSessionsToday,
      completedSessionsToday,
      sessionsNextWeek,
      todayAppointments,
      activePatients,
    ] = await Promise.all([
      this.getTotalSessionsToday(today, endOfToday),
      this.getCompletedSessionsToday(today, endOfToday),
      this.getSessionsNextWeek(new Date(), nextWeek),
      this.getTodayAppointments(today, endOfToday),
      this.getActivePatients(),
    ]);

    return {
      sessionsToday: {
        total: totalSessionsToday,
        completed: completedSessionsToday,
      },
      sessionsNextWeek,
      activePatients,
      todayAppointments,
    };
  }

  private async getTotalSessionsToday(start: Date, end: Date): Promise<number> {
    return await this.appointmentsRepository.count({
      where: {
        appointment_date: Between(start, end),
        status: 'scheduled',
      },
    });
  }

  private async getCompletedSessionsToday(
    start: Date,
    end: Date,
  ): Promise<number> {
    return await this.appointmentsRepository.count({
      where: {
        appointment_date: Between(start, end),
        status: 'completed',
      },
    });
  }

  private async getSessionsNextWeek(start: Date, end: Date): Promise<number> {
    return await this.appointmentsRepository.count({
      where: {
        appointment_date: Between(start, end),
      },
    });
  }

  private async getTodayAppointments(start: Date, end: Date) {
    return await this.appointmentsRepository.find({
      where: {
        appointment_date: Between(start, end),
      },
      relations: ['patient', 'physio'],
      order: {
        appointment_date: 'ASC',
      },
    });
  }

  private async getActivePatients(): Promise<number> {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await this.appointmentsRepository
      .createQueryBuilder('appointment')
      .select('COUNT(DISTINCT appointment.patient_id)', 'count')
      .where('appointment.appointment_date >= :date', { date: threeMonthsAgo })
      .getRawOne();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return parseInt(result.count) || 0;
  }

  private getStartOfDay(date: Date): Date {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  private getEndOfDay(date: Date): Date {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return end;
  }
}
