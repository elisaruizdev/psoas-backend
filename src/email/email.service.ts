import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASSWORD'),
      },
    });
  }

  async sendVerificationEmail(
    email: string,
    name: string,
    token: string,
  ): Promise<void> {
    const verificationUrl = `${this.configService.get<string>('FRONTEND_URL')}/verificar-registro?token=${token}`;

    const mailOptions = {
      from: this.configService.get<string>('MAIL_USER'),
      to: email,
      subject: 'Verifica tu cuenta de psoas',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #5b21b6;">¡Bienvenido a psoas, ${name}!</h2>
          <p>Gracias por registrarte en nuestra plataforma.</p>
          <p>Para activar tu cuenta, haz clic en el siguiente botón:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #5b21b6; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Verificar mi cuenta
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Si no has creado esta cuenta, puedes ignorar este email.
          </p>
          <p style="color: #666; font-size: 14px;">
            Este enlace expirará en 24 horas.
          </p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendPasswordResetEmail(
    email: string,
    name: string,
    token: string,
  ): Promise<void> {
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL')}/resetear-contraseña?token=${token}`;

    const mailOptions = {
      from: this.configService.get<string>('MAIL_USER'),
      to: email,
      subject: 'Recuperar contraseña - psoas',
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #5b21b6;">Hola ${name},</h2>
        <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
        <p>Para crear una nueva contraseña, haz clic en el siguiente botón:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #5b21b6; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Restablecer contraseña
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          Si no has solicitado restablecer tu contraseña, puedes ignorar este email.
        </p>
        <p style="color: #666; font-size: 14px;">
          Este enlace expirará en 1 hora.
        </p>
      </div>
    `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
