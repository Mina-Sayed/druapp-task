import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  MedicalRecord,
  MedicalRecordType,
} from './entities/medical-record.entity';
import { MedicalRecordVersion } from './entities/medical-record-version.entity';
import { UploadMedicalRecordDto } from './dto/upload-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { UsersService } from '../users/users.service';
import { UserRole } from '../auth/dto/register.dto';
import { PaginationDto, PaginatedResponseDto } from './dto/pagination.dto';
import { RecordVersionDto } from './dto/record-version.dto';

@Injectable()
export class MedicalRecordsService {
  private readonly encryptionKey: Buffer;
  private readonly uploadDir: string;

  constructor(
    @InjectRepository(MedicalRecord)
    private medicalRecordsRepository: Repository<MedicalRecord>,
    @InjectRepository(MedicalRecordVersion)
    private medicalRecordVersionRepository: Repository<MedicalRecordVersion>,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private connection: Connection,
  ) {
    this.encryptionKey = crypto.scryptSync(
      this.configService.get<string>('ENCRYPTION_KEY', 'your-encryption-key'),
      'salt',
      32,
    );
    this.uploadDir = path.join(process.cwd(), 'uploads');
    // Ensure upload directory exists
    fs.mkdir(this.uploadDir, { recursive: true }).catch(console.error);
  }

  private encrypt(buffer: Buffer): { encryptedData: Buffer; iv: Buffer } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);
    const encryptedData = Buffer.concat([
      cipher.update(buffer),
      cipher.final(),
    ]);
    return { encryptedData, iv };
  }

  private decrypt(encryptedData: Buffer, iv: Buffer): Buffer {
    try {
      const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        this.encryptionKey,
        iv,
      );
      return Buffer.concat([decipher.update(encryptedData), decipher.final()]);
    } catch (error) {
      throw new BadRequestException('Failed to decrypt file: corrupt or invalid key');
    }
  }

  async uploadRecord(
    file: Express.Multer.File,
    dto: UploadMedicalRecordDto,
    userId: string,
    userRole: UserRole,
  ): Promise<MedicalRecord> {
    const user = await this.usersService.findOne(userId);
    let patient = user;
    let doctor = null;

    if (userRole === UserRole.DOCTOR) {
      if (!dto.patientId) {
        throw new BadRequestException(
          'Patient ID is required when a doctor uploads a record',
        );
      }
      doctor = user;
      patient = await this.usersService.findOne(dto.patientId);
    } else if (userRole === UserRole.PATIENT && dto.patientId) {
      throw new BadRequestException(
        'Patients cannot specify a different patient ID',
      );
    }

    // Encrypt file content
    const { encryptedData, iv } = this.encrypt(file.buffer);

    // Generate unique file key
    const fileKey = `${crypto.randomUUID()}-${file.originalname}`;
    const filePath = path.join(this.uploadDir, fileKey);
    const metadataPath = path.join(this.uploadDir, `${fileKey}.metadata`);

    // Save encrypted file and metadata
    await fs.writeFile(filePath, encryptedData);
    await fs.writeFile(metadataPath, JSON.stringify({ iv: iv.toString('hex') }));

    // Create medical record entry
    const medicalRecord = this.medicalRecordsRepository.create({
      patient,
      doctor,
      type: dto.type,
      fileName: file.originalname,
      fileKey,
      mimeType: file.mimetype,
      description: dto.description,
      isEncrypted: true,
    });

    return this.medicalRecordsRepository.save(medicalRecord);
  }

  async getRecord(
    id: string,
    userId: string,
    userRole: UserRole,
  ): Promise<{ record: MedicalRecord; file: Buffer }> {
    const record = await this.medicalRecordsRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor'],
    });

    if (!record) {
      throw new NotFoundException('Medical record not found');
    }

    // Check access permissions
    if (
      record.patient.id !== userId &&
      (userRole !== UserRole.DOCTOR || record.doctor?.id !== userId)
    ) {
      throw new BadRequestException(
        'You do not have permission to access this record',
      );
    }

    const filePath = path.join(this.uploadDir, record.fileKey);
    const metadataPath = path.join(this.uploadDir, `${record.fileKey}.metadata`);

    try {
      // Read encrypted file and metadata
      const encryptedData = await fs.readFile(filePath);
      const metadata = JSON.parse(
        await fs.readFile(metadataPath, 'utf8'),
      );
      const iv = Buffer.from(metadata.iv, 'hex');

      // Decrypt the file
      const decryptedData = this.decrypt(encryptedData, iv);

      return { record, file: decryptedData };
    } catch (error) {
      throw new NotFoundException('File not found or corrupted');
    }
  }

  async findAllForUser(
    userId: string,
    userRole: UserRole,
    paginationDto: PaginationDto = new PaginationDto(),
  ): Promise<PaginatedResponseDto<MedicalRecord>> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    
    const query = this.medicalRecordsRepository.createQueryBuilder('record');

    if (userRole === UserRole.PATIENT) {
      query.where('record.patient.id = :userId', { userId });
    } else if (userRole === UserRole.DOCTOR) {
      query.where('record.doctor.id = :userId', { userId });
    }

    const [items, totalItems] = await query
      .orderBy('record.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);

    return {
      items,
      meta: {
        totalItems,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
      },
    };
  }

  async deleteRecord(
    id: string,
    userId: string,
    userRole: UserRole,
  ): Promise<void> {
    const record = await this.medicalRecordsRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor'],
    });

    if (!record) {
      throw new NotFoundException('Medical record not found');
    }

    // Only the uploading doctor or the patient can delete the record
    if (
      record.patient.id !== userId &&
      (userRole !== UserRole.DOCTOR || record.doctor?.id !== userId)
    ) {
      throw new BadRequestException(
        'You do not have permission to delete this record',
      );
    }

    const filePath = path.join(this.uploadDir, record.fileKey);
    const metadataPath = path.join(this.uploadDir, `${record.fileKey}.metadata`);

    // Delete files from filesystem
    try {
      await fs.unlink(filePath);
      await fs.unlink(metadataPath);
    } catch (error) {
      console.error('Error deleting files:', error);
    }

    // Delete record from database
    await this.medicalRecordsRepository.remove(record);
  }

  async updateRecord(
    id: string,
    file: Express.Multer.File | null,
    dto: UpdateMedicalRecordDto,
    userId: string,
    userRole: UserRole,
  ): Promise<MedicalRecord> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get the record with its current version
      const record = await this.medicalRecordsRepository.findOne({
        where: { id },
        relations: ['patient', 'doctor'],
      });

      if (!record) {
        throw new NotFoundException('Medical record not found');
      }

      // Check access permissions
      if (
        record.patient.id !== userId &&
        (userRole !== UserRole.DOCTOR || record.doctor?.id !== userId)
      ) {
        throw new BadRequestException(
          'You do not have permission to update this record',
        );
      }

      // Create a version of the current record
      const version = this.medicalRecordVersionRepository.create({
        medicalRecord: record,
        fileName: record.fileName,
        fileKey: record.fileKey,
        mimeType: record.mimeType,
        description: record.description,
        isEncrypted: record.isEncrypted,
        modifiedBy: await this.usersService.findOne(userId),
        changeReason: dto.changeReason,
        versionNumber: record.currentVersion,
      });

      await queryRunner.manager.save(version);

      // Update the record with new data
      if (dto.type) {
        record.type = dto.type;
      }

      if (dto.description) {
        record.description = dto.description;
      }

      let oldFileInfo = null;

      // If a new file is provided, handle it
      if (file) {
        // Store the old file key for cleanup later
        oldFileInfo = {
          filePath: path.join(this.uploadDir, record.fileKey),
          metadataPath: path.join(this.uploadDir, `${record.fileKey}.metadata`),
        };

        // Encrypt and save the new file
        const { encryptedData, iv } = this.encrypt(file.buffer);
        const fileKey = `${crypto.randomUUID()}-${file.originalname}`;
        const filePath = path.join(this.uploadDir, fileKey);
        const metadataPath = path.join(this.uploadDir, `${fileKey}.metadata`);

        await fs.writeFile(filePath, encryptedData);
        await fs.writeFile(metadataPath, JSON.stringify({ iv: iv.toString('hex') }));

        // Update record with new file info
        record.fileName = file.originalname;
        record.fileKey = fileKey;
        record.mimeType = file.mimetype;
        record.isEncrypted = true;
      }

      // Increment version number
      record.currentVersion += 1;

      // Save the updated record
      const updatedRecord = await queryRunner.manager.save(record);
      
      // Commit the transaction
      await queryRunner.commitTransaction();

      // Clean up old files if needed
      if (oldFileInfo) {
        try {
          // Check if the files exist before trying to delete them
          const oldFileExists = await fs.access(oldFileInfo.filePath)
            .then(() => true)
            .catch(() => false);
            
          const oldMetadataExists = await fs.access(oldFileInfo.metadataPath)
            .then(() => true)
            .catch(() => false);
          
          if (oldFileExists) {
            await fs.unlink(oldFileInfo.filePath);
          }
          
          if (oldMetadataExists) {
            await fs.unlink(oldFileInfo.metadataPath);
          }
        } catch (error) {
          console.error('Error deleting old file version:', error);
          // Don't throw the error as the transaction was already committed
        }
      }
      
      return updatedRecord;
    } catch (error) {
      // Rollback in case of error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  async getRecordVersions(
    id: string,
    userId: string,
    userRole: UserRole,
    paginationDto: PaginationDto = new PaginationDto(),
  ): Promise<PaginatedResponseDto<RecordVersionDto>> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    
    const record = await this.medicalRecordsRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor'],
    });

    if (!record) {
      throw new NotFoundException('Medical record not found');
    }

    // Check access permissions
    if (
      record.patient.id !== userId &&
      (userRole !== UserRole.DOCTOR || record.doctor?.id !== userId)
    ) {
      throw new BadRequestException(
        'You do not have permission to access this record',
      );
    }

    const [versions, totalItems] = await this.medicalRecordVersionRepository.findAndCount({
      where: { medicalRecord: { id } },
      relations: ['modifiedBy'],
      order: { versionNumber: 'DESC' },
      skip,
      take: limit,
    });

    const items = versions.map(version => ({
      id: version.id,
      versionNumber: version.versionNumber,
      fileName: version.fileName,
      mimeType: version.mimeType,
      description: version.description,
      modifiedBy: {
        id: version.modifiedBy.id,
        name: version.modifiedBy.name,
      },
      changeReason: version.changeReason,
      createdAt: version.createdAt,
    }));

    const totalPages = Math.ceil(totalItems / limit);

    return {
      items,
      meta: {
        totalItems,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
      },
    };
  }

  async getVersionContent(
    recordId: string,
    versionId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<{ version: MedicalRecordVersion; file: Buffer }> {
    const record = await this.medicalRecordsRepository.findOne({
      where: { id: recordId },
      relations: ['patient', 'doctor'],
    });

    if (!record) {
      throw new NotFoundException('Medical record not found');
    }

    // Check access permissions
    if (
      record.patient.id !== userId &&
      (userRole !== UserRole.DOCTOR || record.doctor?.id !== userId)
    ) {
      throw new BadRequestException(
        'You do not have permission to access this record',
      );
    }

    const version = await this.medicalRecordVersionRepository.findOne({
      where: { id: versionId, medicalRecord: { id: recordId } },
      relations: ['modifiedBy'],
    });

    if (!version) {
      throw new NotFoundException('Version not found');
    }

    const filePath = path.join(this.uploadDir, version.fileKey);
    const metadataPath = path.join(this.uploadDir, `${version.fileKey}.metadata`);

    try {
      // Read encrypted file and metadata
      const encryptedData = await fs.readFile(filePath);
      const metadata = JSON.parse(
        await fs.readFile(metadataPath, 'utf8'),
      );
      const iv = Buffer.from(metadata.iv, 'hex');

      // Decrypt the file
      const decryptedData = this.decrypt(encryptedData, iv);

      return { version, file: decryptedData };
    } catch (error) {
      throw new NotFoundException('File not found or corrupted');
    }
  }
}
