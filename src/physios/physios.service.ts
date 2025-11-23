import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Physios } from './entities/physios.entity';
import { EmailService } from '../email/email.service';

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

    try {
      if (!physio.verification_token) {
        throw new BadRequestException(
          'No hay token de verificación para este fisioterapeuta',
        );
      }
      await this.emailService.sendVerificationEmail(
        physio.email,
        physio.name,
        physio.verification_token,
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new BadRequestException('Error al enviar el email de verificación');
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
}
