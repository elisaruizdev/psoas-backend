import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('physios')
export class Physios {
  @PrimaryGeneratedColumn()
  id_physio: number;

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

  @Column({ length: 100, nullable: true })
  address: string;

  @Column({ length: 50, nullable: true })
  city: string;

  @Column({ length: 10, nullable: true })
  zip: string;

  @Column({ length: 50, nullable: true })
  country: string;

  @Column({ length: 50, unique: true, nullable: true })
  identifier: string;

  @Column({ length: 50, nullable: true })
  license_number: string;

  @Column({ type: 'date', nullable: true })
  birthdate: Date;

  @Column({ length: 20, nullable: true })
  gender: string;

  @Column({ length: 100, nullable: true })
  specialty: string;

  @Column({ type: 'date', nullable: true })
  hire_date: Date;

  @Column({ length: 100, nullable: true })
  schedule: string;

  @Column({ length: 20, default: 'active' })
  status: string;
}
