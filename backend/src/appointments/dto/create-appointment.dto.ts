import {
  IsDate,
  IsNumber,
  IsString,
  IsUUID,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAppointmentDto {
  @IsUUID()
  doctorId: string;

  @Type(() => Date)
  @IsDate()
  scheduledDate: Date;

  @IsNumber()
  @Min(15)
  duration: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
