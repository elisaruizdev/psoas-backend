import { Module } from '@nestjs/common';
import { PhysiosController } from './physios.controller';
import { PhysiosService } from './physios.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Physios } from './entities/physios.entity';
import { EmailModule } from '../email/email.module';

@Module({
  controllers: [PhysiosController],
  providers: [PhysiosService],
  imports: [TypeOrmModule.forFeature([Physios]), EmailModule],
  exports: [PhysiosService],
})
export class PhysiosModule {}
