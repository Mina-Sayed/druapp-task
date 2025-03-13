import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UserRole } from '../auth/dto/register.dto';
import { AppointmentStatus } from './entities/appointment.entity';

@ApiTags('appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @Roles(UserRole.PATIENT)
  create(@Body() createAppointmentDto: CreateAppointmentDto, @Request() req) {
    return this.appointmentsService.create(createAppointmentDto, req.user.id);
  }

  @Get()
  findAll(@Request() req) {
    return this.appointmentsService.findAll(req.user.id, req.user.role);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Put(':id/status')
  @Roles(UserRole.DOCTOR)
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: AppointmentStatus,
    @Body('reason') reason: string,
    @Request() req,
  ) {
    return this.appointmentsService.updateStatus(
      id,
      status,
      req.user.id,
      reason,
    );
  }

  @Put(':id/cancel')
  cancel(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req,
  ) {
    return this.appointmentsService.cancel(id, req.user.id, reason);
  }

  @Get('doctor/:doctorId/availability')
  @Roles(UserRole.PATIENT)
  getDoctorAvailability(
    @Param('doctorId') doctorId: string,
    @Query('date') date: string,
  ) {
    return this.appointmentsService.getDoctorAvailability(
      doctorId,
      new Date(date),
    );
  }
}
