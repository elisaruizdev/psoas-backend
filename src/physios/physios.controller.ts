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
import { UpdatePhysioDto } from './dto/update-physio.dto';

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
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: UpdatePhysioDto,
  ) {
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
