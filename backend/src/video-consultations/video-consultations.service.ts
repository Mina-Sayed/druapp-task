import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import {
  VideoConsultation,
  ConsultationStatus,
} from './entities/video-consultation.entity';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { AppointmentsService } from '../appointments/appointments.service';
import { TwilioService } from '../twilio/twilio.service';

@Injectable()
export class VideoConsultationsService {
  constructor(
    @InjectRepository(VideoConsultation)
    private consultationsRepository: Repository<VideoConsultation>,
    private readonly configService: ConfigService,
    private readonly appointmentsService: AppointmentsService,
    private readonly twilioService: TwilioService,
  ) {}

  async create(
    createConsultationDto: CreateConsultationDto,
  ): Promise<VideoConsultation> {
    const appointment = await this.appointmentsService.findOne(
      createConsultationDto.appointmentId,
    );

    const roomName = `consultation-${appointment.id}-${Date.now()}`;
    
    // Create Twilio room
    await this.twilioService.createRoom(roomName);
    
    const consultation = this.consultationsRepository.create({
      appointment,
      patient: appointment.patient,
      doctor: appointment.doctor,
      scheduledStartTime: createConsultationDto.scheduledStartTime,
      roomName,
      status: ConsultationStatus.SCHEDULED,
    });

    return this.consultationsRepository.save(consultation);
  }

  async generateToken(consultationId: string, userId: string, userName: string): Promise<string> {
    const consultation = await this.findOne(consultationId);
    
    if (consultation.patient.id !== userId && consultation.doctor.id !== userId) {
      throw new BadRequestException('User is not part of this consultation');
    }

    return this.twilioService.generateToken(userName, consultation.roomName);
  }

  async startConsultation(
    consultationId: string,
    doctorId: string,
  ): Promise<VideoConsultation> {
    const consultation = await this.findOne(consultationId);

    if (consultation.doctor.id !== doctorId) {
      throw new BadRequestException(
        'Only the assigned doctor can start the consultation',
      );
    }

    if (consultation.status !== ConsultationStatus.SCHEDULED) {
      throw new BadRequestException('Consultation cannot be started');
    }

    consultation.status = ConsultationStatus.IN_PROGRESS;
    consultation.actualStartTime = new Date();

    return this.consultationsRepository.save(consultation);
  }

  async endConsultation(
    consultationId: string,
    doctorId: string,
  ): Promise<VideoConsultation> {
    const consultation = await this.findOne(consultationId);

    if (consultation.doctor.id !== doctorId) {
      throw new BadRequestException(
        'Only the assigned doctor can end the consultation',
      );
    }

    if (consultation.status !== ConsultationStatus.IN_PROGRESS) {
      throw new BadRequestException('Consultation is not in progress');
    }

    consultation.status = ConsultationStatus.COMPLETED;
    consultation.endTime = new Date();
    consultation.duration = Math.round(
      (consultation.endTime.getTime() - consultation.actualStartTime.getTime()) / 60000,
    );

    return this.consultationsRepository.save(consultation);
  }

  async findOne(id: string): Promise<VideoConsultation> {
    const consultation = await this.consultationsRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor', 'appointment'],
    });

    if (!consultation) {
      throw new NotFoundException('Video consultation not found');
    }

    return consultation;
  }

  async findAllForUser(userId: string): Promise<VideoConsultation[]> {
    return this.consultationsRepository.find({
      where: [{ patient: { id: userId } }, { doctor: { id: userId } }],
      relations: ['patient', 'doctor', 'appointment'],
      order: { scheduledStartTime: 'DESC' },
    });
  }

  async findActiveConsultation(
    userId: string,
  ): Promise<VideoConsultation | null> {
    return this.consultationsRepository.findOne({
      where: [
        { patient: { id: userId }, status: ConsultationStatus.IN_PROGRESS },
        { doctor: { id: userId }, status: ConsultationStatus.IN_PROGRESS },
      ],
      relations: ['patient', 'doctor', 'appointment'],
    });
  }
}
