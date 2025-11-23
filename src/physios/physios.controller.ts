import {
  Controller,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  Body,
  Delete,
} from '@nestjs/common';
import { PhysiosService } from './physios.service';

@Controller('physios')
export class PhysiosController {
  constructor(private readonly physiosService: PhysiosService) {}

  @Get()
  findAll() {
    return this.physiosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.physiosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateData: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.physiosService.update(id, updateData);
  }

  @Patch(':id/approve')
  approvePhysio(@Param('id', ParseIntPipe) id: number) {
    return this.physiosService.approvePhysio(id);
  }

  @Patch(':id/reject')
  rejectPhysio(@Param('id', ParseIntPipe) id: number) {
    return this.physiosService.rejectPhysio(id);
  }

  @Delete(':id')
  deletePhysio(@Param('id', ParseIntPipe) id: number) {
    return this.physiosService.remove(id);
  }
}
