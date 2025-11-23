import { IsString, IsOptional, IsInt, IsDateString } from 'class-validator';

export class UpdateAppointmentDto {
  @IsDateString()
  @IsOptional()
  appointment_date?: string;

  @IsInt()
  @IsOptional()
  duration?: number;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
