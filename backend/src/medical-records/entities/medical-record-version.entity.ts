import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { MedicalRecord } from './medical-record.entity';
import { User } from '../../users/entities/user.entity';

@Entity('medical_record_versions')
export class MedicalRecordVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => MedicalRecord, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'medical_record_id' })
  medicalRecord: MedicalRecord;

  @Column()
  fileName: string;

  @Column()
  fileKey: string;

  @Column()
  mimeType: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: false })
  isEncrypted: boolean;

  @ManyToOne(() => User, { eager: true })
  modifiedBy: User;

  @Column({ type: 'text', nullable: true })
  changeReason: string;

  @Column()
  versionNumber: number;

  @CreateDateColumn()
  createdAt: Date;
} 