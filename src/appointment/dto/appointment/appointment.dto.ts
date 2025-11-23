import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  @IsNotEmpty()
  patient_id: string;

  @IsInt()
  @IsNotEmpty()
  physio_id: number;

  @IsDateString()
  @IsNotEmpty()
  appointment_date: string;

  @IsInt()
  @IsOptional()
  duration?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
