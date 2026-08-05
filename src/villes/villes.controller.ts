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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { VillesService } from './villes.service';
import { CreateVilleDto } from './dto/create-ville.dto';
import { UpdateVilleDto } from './dto/update-ville.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Villes')
@Controller('villes')
export class VillesController {
  constructor(private readonly villesService: VillesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer une ville' })
  @ApiResponse({ status: 201, description: 'Ville créée avec succès' })
  create(@Body() dto: CreateVilleDto) {
    return this.villesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Liste des villes' })
  findAll() {
    return this.villesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Voir une ville' })
  findOne(@Param('id') id: string) {
    return this.villesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Modifier une ville' })
  update(@Param('id') id: string, @Body() dto: UpdateVilleDto) {
    return this.villesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer une ville' })
  remove(@Param('id') id: string) {
    return this.villesService.remove(id);
  }
}