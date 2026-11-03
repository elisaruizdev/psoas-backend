import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Physios } from './entities/physios.entity';
import { EmailService } from '../email/email.service';
import { createEmailToken } from '../auth/email-token';
import { UpdatePhysioDto } from './dto/update-physio.dto';

@Injectable()
export class PhysiosService {
  constructor(
    @InjectRepository(Physios)
    private physiosRepository: Repository<Physios>,
    private emailService: EmailService,
  ) {}

  findAll(): Promise<Physios[]> {
    return this.physiosRepository.find();
  }

  async approvePhysio(id: number): Promise<any> {
    const physio = await this.physiosRepository.findOne({
      where: { id_physio: id },
    });

    if (!physio) {
      throw new NotFoundException('Fisioterapeuta no encontrado');
    }

    if (physio.status !== 'pending_verification') {
      throw new BadRequestException('Este fisioterapeuta ya ha sido procesado');
    }

    // El token se crea ahora y no al registrarse: así caduca 24 h después de aprobar, no
    // 24 h después de pedir el alta. En la BD solo queda su hash (ver auth/email-token.ts).
    const { token, hash } = createEmailToken();
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);
    physio.verification_token = hash;
    physio.verification_token_expires = expires;
    await this.physiosRepository.save(physio);

    try {
      console.log('Intentando enviar email a:', physio.email);

      await this.emailService.sendVerificationEmail(
        physio.email,
        physio.name,
        token,
      );

      console.log('Email enviado exitosamente');
    } catch (error) {
      console.error('ERROR AL ENVIAR EMAIL:', error);
      throw new BadRequestException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        'Error al enviar el email de verificación: ' + error.message,
      );
    }

    return {
      message:
        'Fisioterapeuta aprobado. Se ha enviado el email de verificación.',
    };
  }

  async rejectPhysio(id: number): Promise<any> {
    const physio = await this.physiosRepository.findOne({
      where: { id_physio: id },
    });

    if (!physio) {
      throw new NotFoundException('Fisioterapeuta no encontrado');
    }

    if (physio.status !== 'pending_verification') {
      throw new BadRequestException('Este fisioterapeuta ya ha sido procesado');
    }

    physio.status = 'rejected';
    await this.physiosRepository.save(physio);

    return {
      message: 'Fisioterapeuta rechazado correctamente',
    };
  }

  async findOne(id: number): Promise<Physios> {
    const physio = await this.physiosRepository.findOne({
      where: { id_physio: id },
    });

    if (!physio) {
      throw new NotFoundException('Fisioterapeuta no encontrado');
    }

    return physio;
  }

  async update(id: number, updateData: UpdatePhysioDto): Promise<Physios> {
    const physio = await this.findOne(id);

    Object.assign(physio, updateData);

    return await this.physiosRepository.save(physio);
  }

  async remove(id: number): Promise<any> {
    const physio = await this.findOne(id);

    await this.physiosRepository.remove(physio);

    return {
      message: 'Fisioterapeuta eliminado correctamente',
    };
  }
}
