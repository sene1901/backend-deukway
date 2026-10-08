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

import { QuartiersService } from './quartiers.service';
import { CreateQuartierDto } from './dto/create-quartier.dto';
import { UpdateQuartierDto } from './dto/update-quartier.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Quartiers')
@Controller('quartiers')
export class QuartiersController {
  constructor(private readonly quartiersService: QuartiersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un quartier' })
  @ApiResponse({ status: 201, description: 'Quartier créé avec succès' })
  create(@Body() dto: CreateQuartierDto) {
    return this.quartiersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Liste des quartiers (filtrable par ville)' })
  @ApiQuery({ name: 'villeId', required: false })
  findAll(@Query('villeId') villeId?: string) {
    return this.quartiersService.findAll(villeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Voir un quartier' })
  findOne(@Param('id') id: string) {
    return this.quartiersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Modifier un quartier' })
  update(@Param('id') id: string, @Body() dto: UpdateQuartierDto) {
    return this.quartiersService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer un quartier' })
  remove(@Param('id') id: string) {
    return this.quartiersService.remove(id);
  }
}
