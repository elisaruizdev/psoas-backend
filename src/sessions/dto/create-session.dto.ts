import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
} from 'class-validator';

export class CreateSessionDto {
  @IsString()
  @IsNotEmpty()
  patient_id: string;

  @IsString()
  @IsOptional()
  treatment_id?: string;

  @IsString()
  @IsNotEmpty()
  physio_id: number;

  @IsDateString()
  @IsNotEmpty()
  session_date: string;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  duration: number;

  @IsString()
  @IsNotEmpty()
  techniques_applied: string;

  @IsString()
  @IsNotEmpty()
  patient_evolution: string;

  @IsString()
  @IsOptional()
  observations?: string;

  @IsDateString()
  @IsOptional()
  next_appointment?: string;
}
