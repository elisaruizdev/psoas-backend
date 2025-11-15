import { Module } from '@nestjs/common';
import { PhysiosController } from './physios.controller';
import { PhysiosService } from './physios.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Physios } from './entities/physios.entity';

@Module({
  controllers: [PhysiosController],
  providers: [PhysiosService],
  imports: [TypeOrmModule.forFeature([Physios])],
  exports: [PhysiosService],
})
export class PhysiosModule {}
