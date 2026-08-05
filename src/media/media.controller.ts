import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { MediaType } from '@prisma/client';

import { MediaService } from './media.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Médias')
@Controller()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('annonces/:annonceId/media')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiQuery({
    name: 'type',
    enum: MediaType,
    required: false,
    description: 'IMAGE (défaut), VIDEO, ou VIRTUAL_TOUR',
  })
  @ApiOperation({ summary: 'Ajouter un média à une annonce' })
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @Param('annonceId') annonceId: string,
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
    @Query('type') type: MediaType = MediaType.IMAGE,
  ) {
    return this.mediaService.upload(annonceId, user.id, file, type);
  }

  @Get('annonces/:annonceId/media')
  @ApiOperation({ summary: 'Liste des médias d\'une annonce' })
  findByAnnonce(@Param('annonceId') annonceId: string) {
    return this.mediaService.findByAnnonce(annonceId);
  }

  @Delete('media/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer un média' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.mediaService.remove(id, user.id);
  }
}