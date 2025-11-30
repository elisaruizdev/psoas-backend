import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { Treatment } from '../../treatments/entities/treatment.entity';
import { Physios } from '../../physios/entities/physios.entity';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patient_id: string;

  @ManyToOne(() => Patient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ nullable: true })
  treatment_id: string;

  @ManyToOne(() => Treatment, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'treatment_id' })
  treatment: Treatment;

  @Column()
  physio_id: number;

  @ManyToOne(() => Physios, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'physio_id' })
  physio: Physios;

  @Column({ type: 'date' })
  session_date: Date;

  @Column({ type: 'int' })
  duration: number;

  @Column('text')
  techniques_applied: string;

  @Column('text')
  patient_evolution: string;

  @Column('text', { nullable: true })
  observations: string;

  @Column({ type: 'date', nullable: true })
  next_appointment: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
