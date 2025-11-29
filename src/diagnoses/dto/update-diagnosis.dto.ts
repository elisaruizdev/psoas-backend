import { IsString, IsOptional, IsDateString, IsIn } from 'class-validator';

export class UpdateDiagnosisDto {
  @IsDateString()
  @IsOptional()
  diagnosis_date?: string;

  @IsString()
  @IsOptional()
  diagnosis_type?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  observations?: string;

  @IsString()
  @IsOptional()
  @IsIn(['active', 'resolved'])
  status?: string;
}
