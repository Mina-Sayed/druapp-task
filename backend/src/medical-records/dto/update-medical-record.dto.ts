import { IsEnum, IsString, IsOptional } from 'class-validator';
import { MedicalRecordType } from '../entities/medical-record.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMedicalRecordDto {
  @ApiProperty({
    description: 'Type of medical record',
    enum: MedicalRecordType,
    required: false,
  })
  @IsEnum(MedicalRecordType)
  @IsOptional()
  type?: MedicalRecordType;

  @ApiProperty({
    description: 'Description of the medical record',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Reason for the change',
    required: true,
  })
  @IsString()
  changeReason: string;
} 