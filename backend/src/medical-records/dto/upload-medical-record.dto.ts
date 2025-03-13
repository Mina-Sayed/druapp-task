import { IsEnum, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MedicalRecordType } from '../entities/medical-record.entity';

export class UploadMedicalRecordDto {
  @ApiProperty({
    enum: MedicalRecordType,
    description: 'Type of medical record',
  })
  @IsEnum(MedicalRecordType)
  type: MedicalRecordType;

  @ApiProperty({
    description: 'Description of the medical record',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Patient ID (required when a doctor uploads a record for a patient)',
    required: false,
  })
  @IsString()
  @IsOptional()
  patientId?: string; // When a doctor uploads a record for a patient
}
