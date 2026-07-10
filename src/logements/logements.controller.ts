import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LogementsService } from './logements.service';
import { CreateLogementDto } from './dto/create-logement.dto';
import { UpdateLogementDto } from './dto/update-logement.dto';

@Controller('logements')
export class LogementsController {
  constructor(private readonly logementsService: LogementsService) {}

  @Post()
  create(@Body() createLogementDto: CreateLogementDto) {
    return this.logementsService.create(createLogementDto);
  }

  @Get()
  findAll() {
    return this.logementsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.logementsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLogementDto: UpdateLogementDto) {
    return this.logementsService.update(+id, updateLogementDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.logementsService.remove(+id);
  }
}
