import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';

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

  @Column({ length: 100, unique: true })
  @Index()
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

  @Column({
    type: 'varchar',
    length: 20,
    default: 'pending_verification',
  })
  status: string;

  // Secretos: `select: false` hace que TypeORM no los cargue (tampoco en las relaciones de
  // citas, sesiones o dashboard) salvo que se pidan con `select`. `@Exclude()` es la segunda
  // barrera: si alguien los carga y devuelve la entidad, ClassSerializerInterceptor los quita.
  @Exclude()
  @Column({ type: 'varchar', length: 255, select: false })
  password: string;

  @Column({ default: false })
  is_verified: boolean;

  /** Hash del token del email de verificación (ver auth/email-token.ts), nunca el token. */
  @Exclude()
  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  verification_token: string | null;

  @Exclude()
  @Column({ type: 'timestamp', nullable: true, select: false })
  verification_token_expires: Date | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  /** Hash del token del email de cambio de contraseña, nunca el token. */
  @Exclude()
  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  reset_password_token: string | null;

  @Exclude()
  @Column({ type: 'timestamp', nullable: true, select: false })
  reset_password_token_expires: Date | null;
}
