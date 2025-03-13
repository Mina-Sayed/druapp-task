import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { VideoConsultation } from './entities/video-consultation.entity';
import { VideoConsultationsService } from './video-consultations.service';
import { VideoConsultationsController } from './video-consultations.controller';
import { AppointmentsModule } from '../appointments/appointments.module';
import { TwilioModule } from '../twilio/twilio.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([VideoConsultation]),
    AppointmentsModule,
    TwilioModule,
  ],
  providers: [VideoConsultationsService],
  controllers: [VideoConsultationsController],
  exports: [VideoConsultationsService],
})
export class VideoConsultationsModule {}
