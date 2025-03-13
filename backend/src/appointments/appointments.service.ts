import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UsersService } from '../users/users.service';
import { UserRole } from '../auth/dto/register.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
    private usersService: UsersService,
  ) {}

  async create(
    createAppointmentDto: CreateAppointmentDto,
    patientId: string,
  ): Promise<Appointment> {
    const doctor = await this.usersService.findOne(
      createAppointmentDto.doctorId,
    );
    if (doctor.role !== UserRole.DOCTOR) {
      throw new BadRequestException('Selected user is not a doctor');
    }

    const patient = await this.usersService.findOne(patientId);

    // Check for existing appointments in the same time slot
    const conflictingAppointment = await this.appointmentsRepository.findOne({
      where: {
        doctor: { id: doctor.id },
        scheduledDate: Between(
          createAppointmentDto.scheduledDate,
          new Date(
            createAppointmentDto.scheduledDate.getTime() +
              createAppointmentDto.duration * 60000,
          ),
        ),
        status: AppointmentStatus.APPROVED,
      },
    });

    if (conflictingAppointment) {
      throw new BadRequestException('Doctor is not available at this time');
    }

    const appointment = this.appointmentsRepository.create({
      ...createAppointmentDto,
      doctor,
      patient,
      status: AppointmentStatus.PENDING,
    });

    return this.appointmentsRepository.save(appointment);
  }

  async findAll(userId: string, role: UserRole): Promise<Appointment[]> {
    const query = this.appointmentsRepository.createQueryBuilder('appointment');

    if (role === UserRole.PATIENT) {
      query.where('appointment.patient.id = :userId', { userId });
    } else if (role === UserRole.DOCTOR) {
      query.where('appointment.doctor.id = :userId', { userId });
    }

    return query.orderBy('appointment.scheduledDate', 'DESC').getMany();
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async updateStatus(
    id: string,
    status: AppointmentStatus,
    doctorId: string,
    reason?: string,
  ): Promise<Appointment> {
    const appointment = await this.findOne(id);

    if (appointment.doctor.id !== doctorId) {
      throw new BadRequestException(
        'Only the assigned doctor can update the appointment status',
      );
    }

    appointment.status = status;
    if (reason) {
      appointment.cancellationReason = reason;
    }

    if (status === AppointmentStatus.APPROVED) {
      // Generate video call URL when appointment is approved
      appointment.videoCallUrl = `https://meet.telehealth.app/${appointment.id}`;
    }

    return this.appointmentsRepository.save(appointment);
  }

  async cancel(
    id: string,
    userId: string,
    reason: string,
  ): Promise<Appointment> {
    const appointment = await this.findOne(id);

    if (appointment.patient.id !== userId && appointment.doctor.id !== userId) {
      throw new BadRequestException(
        'Only the patient or doctor can cancel the appointment',
      );
    }

    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed appointment');
    }

    appointment.status = AppointmentStatus.CANCELLED;
    appointment.cancellationReason = reason;

    return this.appointmentsRepository.save(appointment);
  }

  async getDoctorAvailability(
    doctorId: string,
    date: Date,
  ): Promise<boolean[]> {
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const appointments = await this.appointmentsRepository.find({
      where: {
        doctor: { id: doctorId },
        scheduledDate: Between(startOfDay, endOfDay),
        status: AppointmentStatus.APPROVED,
      },
    });

    // Create 30-minute time slots for the day
    const timeSlots = new Array(48).fill(true);

    appointments.forEach((appointment) => {
      const startSlot = Math.floor(
        appointment.scheduledDate.getHours() * 2 +
          appointment.scheduledDate.getMinutes() / 30,
      );
      const duration = Math.ceil(appointment.duration / 30);

      for (let i = 0; i < duration; i++) {
        if (startSlot + i < timeSlots.length) {
          timeSlots[startSlot + i] = false;
        }
      }
    });

    return timeSlots;
  }
}
