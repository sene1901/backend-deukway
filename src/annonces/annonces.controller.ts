import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FilesInterceptor } from '@nestjs/platform-express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UserRole } from '@prisma/client';

import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
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

import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Annonces')
@Controller('annonces')
export class AnnoncesController {
  constructor(
    private readonly annoncesService: AnnoncesService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Créer une annonce avec ses images',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'string',
          description:
            "JSON stringifié des champs de l'annonce (title, description, price, propertyType, address, etc.)",
          example:
            '{"title":"Studio meublé","description":"Proche université","price":150000,"propertyType":"STUDIO","address":"Sacré-Cœur 3"}',
        },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Annonce créée avec succès',
  })
  @UseInterceptors(FilesInterceptor('files', 10))
  async create(
    @CurrentUser() user: any,
    @Body('data') data: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!data) {
      throw new BadRequestException(
        'Le champ "data" (JSON des informations de l’annonce) est requis',
      );
    }

    let parsed: any;

    try {
      parsed = JSON.parse(data);
    } catch {
      throw new BadRequestException(
        'Le champ "data" doit être un JSON valide',
      );
    }

    const dto = plainToInstance(CreateAnnonceDto, parsed);
    const errors = await validate(dto);

    if (errors.length > 0) {
      throw new BadRequestException(
        errors
          .map((error) =>
            Object.values(error.constraints ?? {}),
          )
          .flat(),
      );
    }

    return this.annoncesService.createWithMedia(
      user.id,
      dto,
      files ?? [],
    );
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
    return this.annoncesService.findAll({
      villeId,
      quartierId,
    });
  }

  @Get(':id/similar')
  @ApiOperation({
    summary: 'Annonces similaires',
  })
  findSimilar(@Param('id') id: string) {
    return this.annoncesService.findSimilar(id);
  }

  // Consulter une annonce : public
  @Get(':id')
  @ApiOperation({
    summary: 'Voir une annonce',
  })
  findOne(@Param('id') id: string) {
    return this.annoncesService.findOne(id);
  }

    @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth('access-token')
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
      user.role,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth('access-token')
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
      user.role,
    );
  }
}