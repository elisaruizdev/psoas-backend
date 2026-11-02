import { Controller, Get, INestApplication, Req } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { Physios } from '../physios/entities/physios.entity';
import { AppController } from '../app.controller';
import { AuthController } from './auth.controller';
import { PatientsController } from '../patients/patients.controller';
import { PhysiosController } from '../physios/physios.controller';
import { AppointmentsController } from '../appointment/appointments.controller';
import { DashboardController } from '../dashboard/dashboard.controller';
import { DiagnosesController } from '../diagnoses/diagnoses.controller';
import { TreatmentsController } from '../treatments/treatments.controller';
import { SessionsController } from '../sessions/sessions.controller';
import { JwtAuthGuard, UsuarioAutenticado } from './jwt-auth.guard';
import { IS_PUBLIC_KEY, Public } from './public.decorator';

const SECRETO = 'secreto-de-pruebas-de-al-menos-32-caracteres';

@Controller('prueba')
class PruebaController {
  @Get('privada')
  privada(@Req() req: { user: UsuarioAutenticado }) {
    return req.user;
  }

  @Public()
  @Get('publica')
  publica() {
    return 'ok';
  }
}

describe('JwtAuthGuard', () => {
  let app: INestApplication<App>;
  let jwt: JwtService;
  const physios = new Map<number, Partial<Physios>>();

  beforeAll(async () => {
    jwt = new JwtService({
      secret: SECRETO,
      signOptions: { algorithm: 'HS256' },
    });
    const modulo = await Test.createTestingModule({
      controllers: [PruebaController],
      providers: [
        { provide: JwtService, useValue: jwt },
        {
          provide: getRepositoryToken(Physios),
          useValue: {
            findOne: ({ where }: { where: { id_physio: number } }) =>
              Promise.resolve(physios.get(where.id_physio) ?? null),
          },
        },
        { provide: APP_GUARD, useClass: JwtAuthGuard },
      ],
    }).compile();
    app = modulo.createNestApplication();
    await app.init();
  });

  afterAll(() => app.close());

  beforeEach(() => {
    physios.clear();
    physios.set(1, {
      id_physio: 1,
      email: 'laura@psoas.dev',
      name: 'Laura',
      status: 'active',
    });
    physios.set(2, {
      id_physio: 2,
      email: 'pend@psoas.dev',
      name: 'Pendiente',
      status: 'rejected',
    });
  });

  const token = (sub: number, opciones = {}) =>
    jwt.sign({ sub, email: 'x@psoas.dev', name: 'X' }, opciones);
  const get = (ruta: string, autorizacion?: string) => {
    const peticion = request(app.getHttpServer()).get(ruta);
    return autorizacion
      ? peticion.set('Authorization', autorizacion)
      : peticion;
  };

  it('una ruta @Public() funciona sin token', () =>
    get('/prueba/publica').expect(200, 'ok'));

  it('sin token responde 401', () => get('/prueba/privada').expect(401));

  it.each([
    ['sin "Bearer"', () => token(1)],
    ['"Basic" en vez de "Bearer"', () => `Basic ${token(1)}`],
    ['"Bearer" sin token', () => 'Bearer'],
  ])('cabecera mal formada (%s) responde 401', (_caso, cabecera) =>
    get('/prueba/privada', cabecera()).expect(401),
  );

  it('token inventado responde 401', () =>
    get('/prueba/privada', 'Bearer inventado').expect(401));

  it('token firmado con otro secreto responde 401', () => {
    const falso = new JwtService({
      secret: 'otro-secreto-distinto-de-32-caracteres',
    }).sign({ sub: 1 });
    return get('/prueba/privada', `Bearer ${falso}`).expect(401);
  });

  it('token caducado responde 401', () =>
    get('/prueba/privada', `Bearer ${token(1, { expiresIn: '-1s' })}`).expect(
      401,
    ));

  it('token sin firma (alg "none") responde 401', () => {
    const sinFirma = [
      Buffer.from('{"alg":"none","typ":"JWT"}').toString('base64url'),
      Buffer.from('{"sub":1}').toString('base64url'),
      '',
    ].join('.');
    return get('/prueba/privada', `Bearer ${sinFirma}`).expect(401);
  });

  it('un fisio que ya no está activo no puede seguir usando su token', () =>
    get('/prueba/privada', `Bearer ${token(2)}`).expect(401));

  it('un fisio que ya no existe no puede seguir usando su token', () =>
    get('/prueba/privada', `Bearer ${token(99)}`).expect(401));

  it('token válido de un fisio activo: pasa y deja el usuario en la petición', () =>
    get('/prueba/privada', `Bearer ${token(1)}`).expect(200, {
      id_physio: 1,
      email: 'laura@psoas.dev',
      name: 'Laura',
    }));
});

describe('qué rutas son públicas', () => {
  const esPublico = (objetivo: object) =>
    Reflect.getMetadata(IS_PUBLIC_KEY, objetivo) === true;

  it('solo /auth y la comprobación de salud son públicas', () => {
    expect(esPublico(AuthController)).toBe(true);
    // Se lee el método por su descriptor: no se llama, solo se miran sus metadatos.
    const getHello = Object.getOwnPropertyDescriptor(
      AppController.prototype,
      'getHello',
    )!;
    expect(esPublico(getHello.value as object)).toBe(true);
  });

  // Si alguien añade @Public() a una ruta con datos de pacientes, este test lo para.
  it.each([
    PatientsController,
    PhysiosController,
    AppointmentsController,
    DashboardController,
    DiagnosesController,
    TreatmentsController,
    SessionsController,
  ])('%p no tiene ninguna ruta pública', (controlador) => {
    expect(esPublico(controlador)).toBe(false);
    const metodos = Object.getOwnPropertyNames(controlador.prototype).filter(
      (m) => m !== 'constructor',
    );
    const publicos = metodos.filter((m) =>
      esPublico(controlador.prototype[m as keyof typeof controlador.prototype]),
    );
    expect(publicos).toEqual([]);
  });
});
