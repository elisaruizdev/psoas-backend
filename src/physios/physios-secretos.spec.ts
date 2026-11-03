import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { getMetadataArgsStorage } from 'typeorm';
import { configureApp } from '../app.setup';
import { hashEmailToken } from '../auth/email-token';
import { EmailService } from '../email/email.service';
import { Physios } from './entities/physios.entity';
import { PhysiosController } from './physios.controller';
import { PhysiosService } from './physios.service';

const SECRETOS = [
  'password',
  'verification_token',
  'verification_token_expires',
  'reset_password_token',
  'reset_password_token_expires',
] as const;

/** Un fisio tal como saldría de la BD si alguien cargara también los secretos. */
function fisioConSecretos(): Physios {
  return Object.assign(new Physios(), {
    id_physio: 7,
    name: 'Laura',
    surname: 'Gómez',
    email: 'laura@psoas.dev',
    status: 'active',
    password: '$2b$10$hash-de-bcrypt',
    verification_token: 'hash-verificacion',
    verification_token_expires: new Date(),
    reset_password_token: 'hash-reseteo',
    reset_password_token_expires: new Date(),
  });
}

describe('Fisios: los secretos no salen de la API', () => {
  let app: INestApplication<App>;
  const repo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn((physio: Physios) => Promise.resolve(physio)),
  };
  const email = { sendVerificationEmail: jest.fn() };

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({
      controllers: [PhysiosController],
      providers: [
        PhysiosService,
        { provide: getRepositoryToken(Physios), useValue: repo },
        { provide: EmailService, useValue: email },
      ],
    }).compile();
    app = modulo.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(() => app.close());

  beforeEach(() => jest.clearAllMocks());

  it('la entidad no carga los secretos por defecto (select: false)', () => {
    const columnas = getMetadataArgsStorage().columns.filter(
      (c) => c.target === Physios,
    );
    for (const secreto of SECRETOS) {
      const columna = columnas.find((c) => c.propertyName === secreto);
      expect({ secreto, select: columna?.options.select }).toEqual({
        secreto,
        select: false,
      });
    }
  });

  it('GET /physios no devuelve contraseña ni tokens aunque se hayan cargado', async () => {
    repo.find.mockResolvedValue([fisioConSecretos()]);

    const res = await request(app.getHttpServer()).get('/physios').expect(200);

    const [fisio] = res.body as Record<string, unknown>[];
    expect(fisio).toMatchObject({ id_physio: 7, email: 'laura@psoas.dev' });
    for (const secreto of SECRETOS) {
      expect(fisio).not.toHaveProperty(secreto);
    }
  });

  it('GET /physios/:id tampoco', async () => {
    repo.findOne.mockResolvedValue(fisioConSecretos());

    const res = await request(app.getHttpServer())
      .get('/physios/7')
      .expect(200);

    for (const secreto of SECRETOS) {
      expect(res.body).not.toHaveProperty(secreto);
    }
  });

  it.each([
    ['email', { email: 'atacante@ejemplo.com' }],
    ['status', { status: 'active' }],
    ['is_verified', { is_verified: true }],
    ['password', { password: 'nueva' }],
    ['reset_password_token', { reset_password_token: 'conocido' }],
  ])(
    'PATCH /physios/:id rechaza %s (400) y no guarda nada',
    async (_campo, body) => {
      await request(app.getHttpServer())
        .patch('/physios/7')
        .send(body)
        .expect(400);
      expect(repo.save).not.toHaveBeenCalled();
    },
  );

  it('PATCH /physios/:id acepta los datos de perfil', async () => {
    repo.findOne.mockResolvedValue(fisioConSecretos());

    await request(app.getHttpServer())
      .patch('/physios/7')
      .send({ city: 'Sevilla', phone: '612345678', birthdate: '1990-04-12' })
      .expect(200);

    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({ city: 'Sevilla', phone: '612345678' }),
    );
  });

  it('aprobar guarda solo el hash del token y envía el token en claro por email', async () => {
    repo.findOne.mockResolvedValue(
      Object.assign(new Physios(), {
        id_physio: 9,
        name: 'Pablo',
        email: 'pablo@psoas.dev',
        status: 'pending_verification',
      }),
    );

    await request(app.getHttpServer()).patch('/physios/9/approve').expect(200);

    const [, , tokenEnviado] = email.sendVerificationEmail.mock.calls[0] as [
      string,
      string,
      string,
    ];
    const guardado = repo.save.mock.calls[0][0];
    expect(tokenEnviado).toMatch(/^[0-9a-f]{64}$/);
    expect(guardado.verification_token).toBe(hashEmailToken(tokenEnviado));
    expect(guardado.verification_token).not.toBe(tokenEnviado);
    // Caduca 24 h después de aprobar, no de registrarse.
    const horas =
      (guardado.verification_token_expires!.getTime() - Date.now()) / 3_600_000;
    expect(horas).toBeGreaterThan(23.9);
  });
});
