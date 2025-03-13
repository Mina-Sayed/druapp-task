import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { VideoConsultationsService } from './video-consultations.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UserRole } from '../auth/dto/register.dto';
import { VideoConsultation } from './entities/video-consultation.entity';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('video-consultations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/video-consultations')
export class VideoConsultationsController {
  constructor(
    private readonly videoConsultationsService: VideoConsultationsService,
  ) {}

  @Post()
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ summary: 'Create a new video consultation' })
  @ApiResponse({ status: 201, type: VideoConsultation })
  create(@Body() createConsultationDto: CreateConsultationDto) {
    return this.videoConsultationsService.create(createConsultationDto);
  }

  @Get(':id/token')
  @ApiOperation({ summary: 'Generate Twilio token for video consultation' })
  @ApiResponse({ status: 200, type: String })
  async generateToken(@Param('id') id: string, @Request() req) {
    return this.videoConsultationsService.generateToken(
      id,
      req.user.id,
      req.user.name,
    );
  }

  @Put(':id/start')
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ summary: 'Start a video consultation' })
  @ApiResponse({ status: 200, type: VideoConsultation })
  startConsultation(@Param('id') id: string, @Request() req) {
    return this.videoConsultationsService.startConsultation(id, req.user.id);
  }

  @Put(':id/end')
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ summary: 'End a video consultation' })
  @ApiResponse({ status: 200, type: VideoConsultation })
  endConsultation(@Param('id') id: string, @Request() req) {
    return this.videoConsultationsService.endConsultation(id, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all video consultations for the user' })
  @ApiResponse({ status: 200, type: [VideoConsultation] })
  findAll(@Request() req) {
    return this.videoConsultationsService.findAllForUser(req.user.id);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active video consultation for the user' })
  @ApiResponse({ status: 200, type: VideoConsultation })
  findActiveConsultation(@Request() req) {
    return this.videoConsultationsService.findActiveConsultation(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a video consultation by ID' })
  @ApiResponse({ status: 200, type: VideoConsultation })
  findOne(@Param('id') id: string) {
    return this.videoConsultationsService.findOne(id);
  }
}
