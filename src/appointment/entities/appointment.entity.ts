import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { Physios } from '../../physios/entities/physios.entity';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'patient_id' })
  patient_id: string;

  @Column({ name: 'physio_id' })
  physio_id: number;

  @Column({ type: 'timestamp', name: 'appointment_date' })
  appointment_date: Date;

  @Column({ type: 'integer', default: 60 })
  duration: number;

  @Column({ type: 'integer', name: 'session_number' })
  session_number: number;

  @Column({ length: 20, default: 'scheduled' })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ManyToOne(() => Physios)
  @JoinColumn({ name: 'physio_id' })
  physio: Physios;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
