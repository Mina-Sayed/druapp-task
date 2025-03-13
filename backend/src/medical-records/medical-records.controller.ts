import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Query,
  Patch,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags, ApiConsumes, ApiQuery, ApiOperation, ApiParam } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MedicalRecordsService } from './medical-records.service';
import { UploadMedicalRecordDto } from './dto/upload-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { PaginationDto } from './dto/pagination.dto';

@ApiTags('medical-records')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('medical-records')
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a new medical record' })
  @UseInterceptors(FileInterceptor('file'))
  uploadRecord(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadMedicalRecordDto: UploadMedicalRecordDto,
    @Request() req,
  ) {
    return this.medicalRecordsService.uploadRecord(
      file,
      uploadMedicalRecordDto,
      req.user.id,
      req.user.role,
    );
  }

  @Get()
  @ApiQuery({ type: PaginationDto })
  @ApiOperation({ summary: 'Get all medical records for the current user' })
  findAll(@Request() req, @Query() paginationDto: PaginationDto) {
    return this.medicalRecordsService.findAllForUser(
      req.user.id,
      req.user.role,
      paginationDto,
    );
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'Medical record ID' })
  @ApiOperation({ summary: 'Get a specific medical record' })
  getRecord(@Param('id') id: string, @Request() req) {
    return this.medicalRecordsService.getRecord(id, req.user.id, req.user.role);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', description: 'Medical record ID' })
  @ApiOperation({ summary: 'Update a medical record and create a new version' })
  @UseInterceptors(FileInterceptor('file'))
  updateRecord(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateMedicalRecordDto: UpdateMedicalRecordDto,
    @Request() req,
  ) {
    return this.medicalRecordsService.updateRecord(
      id,
      file,
      updateMedicalRecordDto,
      req.user.id,
      req.user.role,
    );
  }

  @Get(':id/versions')
  @ApiParam({ name: 'id', description: 'Medical record ID' })
  @ApiQuery({ type: PaginationDto })
  @ApiOperation({ summary: 'Get all versions of a medical record' })
  getRecordVersions(
    @Param('id') id: string, 
    @Request() req,
    @Query() paginationDto: PaginationDto
  ) {
    return this.medicalRecordsService.getRecordVersions(
      id,
      req.user.id,
      req.user.role,
      paginationDto,
    );
  }

  @Get(':recordId/versions/:versionId')
  @ApiParam({ name: 'recordId', description: 'Medical record ID' })
  @ApiParam({ name: 'versionId', description: 'Version ID' })
  @ApiOperation({ summary: 'Get a specific version of a medical record' })
  async getVersionContent(
    @Param('recordId') recordId: string,
    @Param('versionId') versionId: string,
    @Request() req,
    @Res() res: Response,
  ) {
    const { version, file } = await this.medicalRecordsService.getVersionContent(
      recordId,
      versionId,
      req.user.id,
      req.user.role,
    );

    res.set({
      'Content-Type': version.mimeType,
      'Content-Disposition': `attachment; filename="${version.fileName}"`,
    });

    return res.send(file);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', description: 'Medical record ID' })
  @ApiOperation({ summary: 'Delete a medical record' })
  deleteRecord(@Param('id') id: string, @Request() req) {
    return this.medicalRecordsService.deleteRecord(
      id,
      req.user.id,
      req.user.role,
    );
  }
}
