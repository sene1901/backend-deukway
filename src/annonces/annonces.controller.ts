import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AnnoncesService } from './annonces.service';

import { CreateAnnonceDto } from './dto/create-annonce.dto';
import { UpdateAnnonceDto } from './dto/update-annonce.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Annonces')
@Controller('annonces')
export class AnnoncesController {
  constructor(
    private readonly annoncesService: AnnoncesService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Créer une annonce',
  })
  @ApiResponse({
    status: 201,
    description: 'Annonce créée avec succès',
  })
  create(
    @CurrentUser() user: any,
    @Body() dto: CreateAnnonceDto,
  ) {
    return this.annoncesService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Liste des annonces',
  })
  @ApiQuery({
    name: 'villeId',
    required: false,
    description: 'Filtrer les annonces par ville',
  })
  @ApiQuery({
    name: 'quartierId',
    required: false,
    description: 'Filtrer les annonces par quartier',
  })
  findAll(
    @Query('villeId') villeId?: string,
    @Query('quartierId') quartierId?: string,
  ) {
    return this.annoncesService.findAll({ villeId, quartierId });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Voir une annonce',
  })
  findOne(@Param('id') id: string) {
    return this.annoncesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Modifier une annonce',
  })
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateAnnonceDto,
  ) {
    return this.annoncesService.update(
      id,
      user.id,
      dto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Supprimer une annonce',
  })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.annoncesService.remove(
      id,
      user.id,
    );
  }
}