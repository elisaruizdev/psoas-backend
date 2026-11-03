import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Physios } from '../physios/entities/physios.entity';
import { createEmailToken, hashEmailToken } from './email-token';

import { EmailService } from '../email/email.service';
import { RegisterDto } from './dto/register.dto/register.dto';
import { LoginDto } from './dto/login.dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password/reset-password.dto';
import { ForgotPasswordDto } from './dto/forget-password/forget-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Physios)
    private physiosRepository: Repository<Physios>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name, surname, phone } = registerDto;

    const existingPhysio = await this.physiosRepository.findOne({
      where: { email },
    });

    if (existingPhysio) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // El token de verificación se crea al aprobar la solicitud (PhysiosService.approvePhysio):
    // si se creara aquí, caducaría antes de que un administrador la revisara.
    const newPhysio = this.physiosRepository.create({
      email,
      password: hashedPassword,
      name,
      surname,
      phone,
      is_verified: false,
      status: 'pending_verification',
    });

    await this.physiosRepository.save(newPhysio);

    return {
      message:
        'Registro exitoso. Tu solicitud está pendiente de aprobación por el administrador.',
    };
  }

  async verifyEmail(token: string) {
    const physio = await this.physiosRepository.findOne({
      where: { verification_token: hashEmailToken(token) },
      select: { id_physio: true, verification_token_expires: true },
    });

    if (!physio) {
      throw new BadRequestException('Token de verificación inválido');
    }

    if (
      !physio.verification_token_expires ||
      new Date() > physio.verification_token_expires
    ) {
      throw new BadRequestException(
        'El token de verificación ha expirado. Por favor, solicita uno nuevo.',
      );
    }

    physio.is_verified = true;
    physio.status = 'active';
    physio.verification_token = null;
    physio.verification_token_expires = null;

    await this.physiosRepository.save(physio);

    return {
      message: 'Email verificado correctamente. Ya puedes iniciar sesión.',
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const physio = await this.physiosRepository.findOne({
      where: { email },
      // `password` no se carga por defecto (select: false en la entidad): aquí sí hace falta.
      select: {
        id_physio: true,
        email: true,
        name: true,
        surname: true,
        is_verified: true,
        status: true,
        password: true,
      },
    });

    if (!physio) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (!physio.is_verified) {
      throw new UnauthorizedException(
        'Por favor, verifica tu email antes de iniciar sesión',
      );
    }

    if (physio.status !== 'active') {
      throw new UnauthorizedException('Tu cuenta no está activa');
    }

    const isPasswordValid = await bcrypt.compare(password, physio.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const payload = {
      sub: physio.id_physio,
      email: physio.email,
      name: physio.name,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id_physio: physio.id_physio,
        email: physio.email,
        name: physio.name,
        surname: physio.surname,
      },
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    console.log('🔍 Iniciando forgot password para:', email);

    const physio = await this.physiosRepository.findOne({
      where: { email },
    });

    if (!physio) {
      console.log('❌ Usuario no encontrado:', email);
      return {
        message: 'Si el email existe, recibirás un enlace de recuperación',
      };
    }

    console.log('✅ Usuario encontrado:', physio.email);

    const { token: resetToken, hash: resetTokenHash } = createEmailToken();
    const resetTokenExpires = new Date();
    resetTokenExpires.setHours(resetTokenExpires.getHours() + 1);

    physio.reset_password_token = resetTokenHash;
    physio.reset_password_token_expires = resetTokenExpires;

    await this.physiosRepository.save(physio);
    console.log('✅ Token guardado en BD');

    try {
      console.log('📧 Intentando enviar email...');
      await this.emailService.sendPasswordResetEmail(
        email,
        physio.name,
        resetToken,
      );
      console.log('✅ Email enviado correctamente');
    } catch (error) {
      console.error('❌ ERROR al enviar email:', error);
      physio.reset_password_token = null;
      physio.reset_password_token_expires = null;
      await this.physiosRepository.save(physio);

      throw new BadRequestException('Error al enviar el email de recuperación');
    }

    return {
      message: 'Si el email existe, recibirás un enlace de recuperación',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password } = resetPasswordDto;

    const physio = await this.physiosRepository.findOne({
      where: { reset_password_token: hashEmailToken(token) },
      select: { id_physio: true, reset_password_token_expires: true },
    });

    if (!physio) {
      throw new BadRequestException('Token de recuperación inválido');
    }

    if (
      !physio.reset_password_token_expires ||
      new Date() > physio.reset_password_token_expires
    ) {
      throw new BadRequestException(
        'El token de recuperación ha expirado. Por favor, solicita uno nuevo.',
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    physio.password = hashedPassword;
    physio.reset_password_token = null;
    physio.reset_password_token_expires = null;

    await this.physiosRepository.save(physio);

    return {
      message:
        'Contraseña actualizada correctamente. Ya puedes iniciar sesión.',
    };
  }
}
