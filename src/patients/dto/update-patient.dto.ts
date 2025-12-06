import {
  IsString,
  IsEmail,
  IsOptional,
  IsDateString,
  IsIn,
} from 'class-validator';

export class UpdatePatientDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  surname?: string;

  @IsString()
  @IsOptional()
  second_surname?: string;

  @IsString()
  @IsOptional()
  identifier?: string;

  @IsDateString()
  @IsOptional()
  birthdate?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  zip?: string;

  @IsString()
  @IsOptional()
  emergency_contact?: string;

  @IsString()
  @IsOptional()
  health_insurance?: string;

  @IsString()
  @IsOptional()
  consultation_reason?: string;

  @IsString()
  @IsOptional()
  medical_history?: string;

  @IsString()
  @IsIn(['active', 'inactive'])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  discharge_reason?: string;
}
