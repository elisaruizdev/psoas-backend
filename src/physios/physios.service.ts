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

      console.log('Intentando enviar email a:', physio.email);

      await this.emailService.sendVerificationEmail(
        physio.email,
        physio.name,
        physio.verification_token,
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

  async update(id: number, updateData: Partial<Physios>): Promise<Physios> {
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
