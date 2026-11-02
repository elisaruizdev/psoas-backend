import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { Physios } from '../physios/entities/physios.entity';
import { IS_PUBLIC_KEY } from './public.decorator';

/** Lo que firma AuthService.login. */
export interface JwtPayload {
  sub: number;
  email: string;
  name: string;
}

/** Usuario autenticado que queda en `request.user` para los controladores. */
export interface UsuarioAutenticado {
  id_physio: number;
  email: string;
  name: string;
}

/**
 * Guard global: toda ruta exige un JWT válido salvo las marcadas con @Public().
 *
 * - Algoritmo fijo (HS256): nunca se acepta el que diga la cabecera del token.
 * - Además de firma y caducidad, comprueba que el fisio siga existiendo y activo: una cuenta
 *   rechazada o desactivada deja de funcionar al momento, sin esperar a que caduque su token.
 * - Mensaje genérico en todos los fallos: no da pistas de qué parte del token falló.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    @InjectRepository(Physios)
    private readonly physiosRepository: Repository<Physios>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const esPublica = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (esPublica) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: UsuarioAutenticado }>();
    const token = this.extraerToken(request);
    if (!token) {
      throw new UnauthorizedException('Falta el token de sesión');
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        algorithms: ['HS256'],
      });
    } catch {
      throw new UnauthorizedException('Sesión no válida o caducada');
    }

    const physio = await this.physiosRepository.findOne({
      where: { id_physio: payload.sub },
      select: ['id_physio', 'email', 'name', 'status'],
    });
    if (!physio || physio.status !== 'active') {
      throw new UnauthorizedException('Sesión no válida o caducada');
    }

    request.user = {
      id_physio: physio.id_physio,
      email: physio.email,
      name: physio.name,
    };
    return true;
  }

  private extraerToken(request: Request): string | undefined {
    const [tipo, token] = request.headers.authorization?.split(' ') ?? [];
    return tipo === 'Bearer' && token ? token : undefined;
  }
}
