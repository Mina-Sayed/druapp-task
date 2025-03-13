import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { MedicalRecordVersion } from './medical-record-version.entity';

export enum MedicalRecordType {
  PRESCRIPTION = 'prescription',
  LAB_REPORT = 'lab_report',
  MEDICAL_HISTORY = 'medical_history',
  OTHER = 'other',
}

@Entity('medical_records')
export class MedicalRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true })
  patient: User;

  @ManyToOne(() => User, { eager: true })
  doctor: User;

  @Column({
    type: 'enum',
    enum: MedicalRecordType,
  })
  type: MedicalRecordType;

  @Column()
  fileName: string;

  @Column()
  fileKey: string; // MinIO object key

  @Column()
  mimeType: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: false })
  isEncrypted: boolean;

  @Column({ default: 1 })
  currentVersion: number;

  @OneToMany(() => MedicalRecordVersion, version => version.medicalRecord)
  versions: MedicalRecordVersion[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
