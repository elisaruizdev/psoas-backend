import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { EmailService } from '../email/email.service';
import { Physios } from '../physios/entities/physios.entity';
import { AuthService } from './auth.service';
import { hashEmailToken } from './email-token';

describe('AuthService: tokens de email y contraseña', () => {
  let service: AuthService;
  let repo: {
    findOne: jest.Mock<Promise<Partial<Physios> | null>, [unknown]>;
    save: jest.Mock<Promise<Physios>, [Physios]>;
    create: jest.Mock<Partial<Physios>, [Partial<Physios>]>;
  };
  let email: {
    sendPasswordResetEmail: jest.Mock<Promise<void>, [string, string, string]>;
  };

  beforeEach(() => {
    repo = {
      findOne: jest.fn<Promise<Partial<Physios> | null>, [unknown]>(),
      save: jest.fn((p: Physios) => Promise.resolve(p)),
      create: jest.fn((p: Partial<Physios>) => p),
    };
    email = {
      sendPasswordResetEmail: jest.fn<Promise<void>, [string, string, string]>(
        () => Promise.resolve(),
      ),
    };
    service = new AuthService(
      repo as unknown as Repository<Physios>,
      new JwtService({
        secret: 'secreto-de-pruebas-de-al-menos-32-caracteres',
      }),
      email as unknown as EmailService,
    );
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('recuperar contraseña: en la BD queda el hash y por email va el token', async () => {
    repo.findOne.mockResolvedValue({
      id_physio: 7,
      email: 'a@psoas.dev',
      name: 'Ana',
    });

    await service.forgotPassword({ email: 'a@psoas.dev' });

    const enviado = email.sendPasswordResetEmail.mock.calls[0][2];
    const guardado = repo.save.mock.calls[0][0];
    expect(guardado.reset_password_token).toBe(hashEmailToken(enviado));
    expect(guardado.reset_password_token).not.toBe(enviado);
  });

  it('cambiar contraseña: busca por el hash del token y lo invalida al usarlo', async () => {
    const enUnaHora = new Date(Date.now() + 3_600_000);
    repo.findOne.mockResolvedValue({
      id_physio: 7,
      reset_password_token_expires: enUnaHora,
    });

    await service.resetPassword({
      token: 'token-del-email',
      password: 'Nueva1234!',
    });

    expect(repo.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { reset_password_token: hashEmailToken('token-del-email') },
      }),
    );
    const guardado = repo.save.mock.calls[0][0];
    expect(guardado.reset_password_token).toBeNull();
    expect(await bcrypt.compare('Nueva1234!', guardado.password)).toBe(true);
  });

  it('cambiar contraseña con un token que no está: 400', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(
      service.resetPassword({ token: 'inventado', password: 'Nueva1234!' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('verificar email: busca por el hash del token', async () => {
    const manana = new Date(Date.now() + 86_400_000);
    repo.findOne.mockResolvedValue({
      id_physio: 7,
      verification_token_expires: manana,
    });

    await service.verifyEmail('token-del-email');

    expect(repo.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { verification_token: hashEmailToken('token-del-email') },
      }),
    );
    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        is_verified: true,
        status: 'active',
        verification_token: null,
      }),
    );
  });

  it('login: pide la contraseña de forma explícita (no se carga por defecto)', async () => {
    repo.findOne.mockResolvedValue({
      id_physio: 7,
      email: 'a@psoas.dev',
      name: 'Ana',
      surname: 'Ruiz',
      is_verified: true,
      status: 'active',
      password: await bcrypt.hash('Demo1234!', 4),
    });

    const res = await service.login({
      email: 'a@psoas.dev',
      password: 'Demo1234!',
    });

    const [opciones] = repo.findOne.mock.calls[0] as [
      { select: Record<string, boolean> },
    ];
    expect(opciones.select.password).toBe(true);
    expect(res.access_token).toBeTruthy();
    expect(res.user).not.toHaveProperty('password');
  });

  it('registro: ya no crea el token de verificación (se crea al aprobar)', async () => {
    repo.findOne.mockResolvedValue(null);

    await service.register({
      email: 'nuevo@psoas.dev',
      password: 'Segura123',
      name: 'Nuevo',
      surname: 'Fisio',
      second_surname: 'Prueba',
      phone: '612345678',
    });

    const creado = repo.create.mock.calls[0][0];
    expect(creado).not.toHaveProperty('verification_token');
    expect(creado.status).toBe('pending_verification');
  });
});
