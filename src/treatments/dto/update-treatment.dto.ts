import {
  IsString,
  IsOptional,
  IsDateString,
  IsIn,
  IsInt,
  Min,
} from 'class-validator';

export class UpdateTreatmentDto {
  @IsString()
  @IsOptional()
  treatment_name?: string;

  @IsDateString()
  @IsOptional()
  start_date?: string;

  @IsDateString()
  @IsOptional()
  end_date?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  objectives?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  sessions_planned?: number;

  @IsString()
  @IsOptional()
  @IsIn(['active', 'completed', 'paused'])
  status?: string;
}
