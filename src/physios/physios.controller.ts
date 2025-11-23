import { Controller, Get, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { PhysiosService } from './physios.service';

@Controller('physios')
export class PhysiosController {
  constructor(private readonly physiosService: PhysiosService) {}

  @Get()
  findAll() {
    return this.physiosService.findAll();
  }

  @Patch(':id/approve')
  approvePhysio(@Param('id', ParseIntPipe) id: number) {
    return this.physiosService.approvePhysio(id);
  }

  @Patch(':id/reject')
  rejectPhysio(@Param('id', ParseIntPipe) id: number) {
    return this.physiosService.rejectPhysio(id);
  }
}
