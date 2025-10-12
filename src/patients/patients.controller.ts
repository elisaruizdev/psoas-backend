import { Controller, Get } from '@nestjs/common';
import { PatientsService } from './patients.service';

@Controller('patients') // Ruta base para pacientes
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get() // GET /patients
  findAllPatients() {
    return this.patientsService.findAllPatients();
  }

  @Get(':id') // GET /patients/:id
  findOnePatient(id: number) {
    return this.patientsService.findOnePatient(id);
  }
}
