import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Comprobación de salud (la usan Render y Docker): sin datos, sin token.
  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
