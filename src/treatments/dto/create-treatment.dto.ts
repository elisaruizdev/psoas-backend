import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsIn,
  IsInt,
  Min,
} from 'class-validator';

export class CreateTreatmentDto {
  @IsString()
  @IsNotEmpty()
  patient_id: string;

  @IsString()
  @IsNotEmpty()
  treatment_name: string;

  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @IsDateString()
  @IsOptional()
  end_date?: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  objectives: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  sessions_planned?: number;

  @IsString()
  @IsOptional()
  @IsIn(['active', 'completed', 'paused'])
  status?: string;
}
