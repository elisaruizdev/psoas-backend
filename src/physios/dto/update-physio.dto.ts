import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Lo que se puede cambiar de un fisio con PATCH /physios/:id: solo datos de perfil.
 *
 * Con `whitelist` y `forbidNonWhitelisted` (main.ts), cualquier otro campo (email, status,
 * is_verified, password, tokens...) se rechaza con 400. Antes el body era `any` y se copiaba
 * entero a la entidad, así que se podía cambiar el email o el token de reseteo de otro fisio.
 */
export class UpdatePhysioDto {
  @IsString()
  @MaxLength(50)
  @IsOptional()
  identifier?: string;

  @IsDateString()
  @IsOptional()
  birthdate?: string;

  @IsString()
  @MaxLength(20)
  @IsOptional()
  gender?: string;

  @IsString()
  @MaxLength(12)
  @IsOptional()
  phone?: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  license_number?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  specialty?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  schedule?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  address?: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  city?: string;

  @IsString()
  @MaxLength(10)
  @IsOptional()
  zip?: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  country?: string;
}
