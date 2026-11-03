import { createHash, randomBytes } from 'crypto';

/**
 * Tokens de un solo uso que viajan en un enlace de email (verificar cuenta, cambiar contraseña).
 *
 * El token en claro solo va en el email. En la base de datos se guarda su hash: si alguien lee
 * la tabla (o una respuesta de la API que la filtre), no puede usar el enlace.
 */
export function createEmailToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString('hex');
  return { token, hash: hashEmailToken(token) };
}

/** sha256 basta: el token es aleatorio de 256 bits, no una contraseña que se pueda adivinar. */
export function hashEmailToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
