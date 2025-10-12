import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn()
  id_patient: number;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 50 })
  surname: string;

  @Column({ length: 50, nullable: true })
  second_surname: string;

  @Column({ length: 12 })
  phone: string;

  @Column({ length: 50 })
  email: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 50, nullable: true })
  city: string;

  @Column({ length: 10, nullable: true })
  zip: string;

  @Column({ length: 50, nullable: true })
  country: string;

  @Column({ length: 50, unique: true, nullable: true })
  identifier: string;

  @Column({ type: 'date', nullable: true })
  birthdate: Date;

  @Column({ length: 20, nullable: true })
  gender: string;

  @Column({ type: 'timestamp', nullable: true })
  register_date: Date;

  @Column({ length: 200, nullable: true })
  discharge_reason: string;

  @Column({ length: 20, default: 'active' })
  status: string;
}
