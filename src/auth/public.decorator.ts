import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marca una ruta (o un controlador entero) como pública: el guard global de JWT la deja pasar
 * sin token. Todo lo que no lleve @Public() exige sesión iniciada.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
