import { IsUUID, IsDateString } from 'class-validator';

export class CreateConsultationDto {
  @IsUUID()
  appointmentId: string;

  @IsDateString()
  scheduledStartTime: Date;
}
