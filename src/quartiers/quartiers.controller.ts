import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { QuartiersService } from './quartiers.service';
import { CreateQuartierDto } from './dto/create-quartier.dto';
import { UpdateQuartierDto } from './dto/update-quartier.dto';

@Controller('quartiers')
export class QuartiersController {
  constructor(private readonly quartiersService: QuartiersService) {}

  @Post()
  create(@Body() createQuartierDto: CreateQuartierDto) {
    return this.quartiersService.create(createQuartierDto);
  }

  @Get()
  findAll() {
    return this.quartiersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quartiersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQuartierDto: UpdateQuartierDto) {
    return this.quartiersService.update(+id, updateQuartierDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quartiersService.remove(+id);
  }
}
