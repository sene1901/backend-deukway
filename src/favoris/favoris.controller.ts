import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { FavorisService } from './favoris.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Favoris')
@Controller('favoris')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FavorisController {
  constructor(private readonly favorisService: FavorisService) {}

  @Post(':annonceId')
  @ApiOperation({
    summary: 'Ajouter une annonce aux favoris',
  })
  add(
    @CurrentUser() user: any,
    @Param('annonceId') annonceId: string,
  ) {
    return this.favorisService.add(user.id, annonceId);
  }

  @Delete(':annonceId')
  @ApiOperation({
    summary: 'Retirer une annonce des favoris',
  })
  remove(
    @CurrentUser() user: any,
    @Param('annonceId') annonceId: string,
  ) {
    return this.favorisService.remove(user.id, annonceId);
  }

  @Get()
  @ApiOperation({
    summary: 'Liste des favoris de l\'utilisateur connecté',
  })
  findAll(@CurrentUser() user: any) {
    return this.favorisService.findAll(user.id);
  }

  @Get('check/:annonceId')
  @ApiOperation({
    summary: 'Vérifier si une annonce est en favori',
  })
  check(
    @CurrentUser() user: any,
    @Param('annonceId') annonceId: string,
  ) {
    return this.favorisService.check(user.id, annonceId);
  }
}
