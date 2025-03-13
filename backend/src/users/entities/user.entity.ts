import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { MedicalRecord } from '../../medical-records/entities/medical-record.entity';
import { VideoConsultation } from '../../video-consultations/entities/video-consultation.entity';
import { Message } from '../../messages/messages.entity';
import { UserRole } from '../../auth/dto/register.dto';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.PATIENT,
  })
  role: UserRole;

  @Column({ nullable: true })
  image: string;

  @Column({ default: false })
  mfaEnabled: boolean;

  @Column({ nullable: true })
  mfaSecret: string;

  @Column({ nullable: true })
  tempMfaSecret: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Additional fields for doctor profile
  @Column({ nullable: true })
  specialization: string;

  @Column({ nullable: true })
  licenseNumber: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  // Additional fields for patient profile
  @Column({ nullable: true })
  dateOfBirth: Date;

  @Column({ nullable: true })
  bloodType: string;

  @Column({ type: 'simple-array', nullable: true })
  allergies: string[];

  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Message[];

  @OneToMany(() => Message, (message) => message.receiver)
  receivedMessages: Message[];

  @OneToMany(() => Appointment, (appointment) => appointment.patient)
  patientAppointments: Appointment[];

  @OneToMany(() => Appointment, (appointment) => appointment.doctor)
  doctorAppointments: Appointment[];

  @OneToMany(() => MedicalRecord, (medicalRecord) => medicalRecord.patient)
  patientMedicalRecords: MedicalRecord[];

  @OneToMany(() => MedicalRecord, (medicalRecord) => medicalRecord.doctor)
  doctorMedicalRecords: MedicalRecord[];

  @OneToMany(
    () => VideoConsultation,
    (videoConsultation) => videoConsultation.patient,
  )
  patientVideoConsultations: VideoConsultation[];

  @OneToMany(
    () => VideoConsultation,
    (videoConsultation) => videoConsultation.doctor,
  )
  doctorVideoConsultations: VideoConsultation[];
}
