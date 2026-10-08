import {
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { ContractsService } from './contracts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Contrats')
@Controller('contracts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get()
  @ApiOperation({ summary: 'Mes contrats (locataire ou propriétaire)' })
  findMine(@CurrentUser() user: any) {
    return this.contractsService.findMine(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Voir un contrat' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.contractsService.findOne(id, user.id);
  }

  @Patch(':id/sign')
  @ApiOperation({ summary: 'Signer électroniquement le contrat' })
  sign(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.contractsService.sign(id, user.id);
  }
}