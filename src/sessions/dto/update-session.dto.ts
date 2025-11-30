import {
  IsString,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
} from 'class-validator';

export class UpdateSessionDto {
  @IsString()
  @IsOptional()
  treatment_id?: string;

  @IsString()
  @IsOptional()
  physio_id?: number;

  @IsDateString()
  @IsOptional()
  session_date?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  duration?: number;

  @IsString()
  @IsOptional()
  techniques_applied?: string;

  @IsString()
  @IsOptional()
  patient_evolution?: string;

  @IsString()
  @IsOptional()
  observations?: string;

  @IsDateString()
  @IsOptional()
  next_appointment?: string;
}
