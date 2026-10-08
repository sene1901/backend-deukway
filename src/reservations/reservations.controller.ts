import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Réservations')
@Controller('reservations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReservationsController {
  constructor(
    private readonly reservationsService: ReservationsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Demander une visite',
  })
  create(
    @CurrentUser() user: any,
    @Body() dto: CreateReservationDto,
  ) {
    return this.reservationsService.create(user.id, dto);
  }

  @Get('mine')
  @ApiOperation({
    summary: 'Mes demandes de visite (en tant que locataire)',
  })
  findMine(@CurrentUser() user: any) {
    return this.reservationsService.findMine(user.id);
  }

  @Get('received')
  @ApiOperation({
    summary: 'Demandes reçues sur mes annonces (en tant que propriétaire)',
  })
  findReceived(@CurrentUser() user: any) {
    return this.reservationsService.findReceived(user.id);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Confirmer ou rejeter une visite (propriétaire)',
  })
  updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateReservationStatusDto,
  ) {
    return this.reservationsService.updateStatus(id, user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Annuler ma demande de visite (locataire)',
  })
  cancel(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.reservationsService.cancel(id, user.id);
  }
}
