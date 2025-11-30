import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsIn,
} from 'class-validator';

export class CreateDiagnosisDto {
  @IsString()
  @IsNotEmpty()
  patient_id: string;

  @IsDateString()
  @IsNotEmpty()
  diagnosis_date: string;

  @IsString()
  @IsNotEmpty()
  diagnosis_type: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  observations?: string;

  @IsString()
  @IsOptional()
  @IsIn(['active', 'resolved'])
  status?: string;
}
