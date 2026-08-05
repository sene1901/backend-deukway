import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Messages')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Envoyer un message' })
  send(
    @CurrentUser() user: any,
    @Body() dto: CreateMessageDto,
  ) {
    return this.messagesService.send(user.id, dto);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Liste de mes conversations' })
  findConversations(@CurrentUser() user: any) {
    return this.messagesService.findConversations(user.id);
  }

  @Get('conversations/:otherUserId')
  @ApiOperation({
    summary: 'Messages échangés avec un utilisateur',
  })
  @ApiQuery({ name: 'annonceId', required: false })
  findConversation(
    @CurrentUser() user: any,
    @Param('otherUserId') otherUserId: string,
    @Query('annonceId') annonceId?: string,
  ) {
    return this.messagesService.findConversation(
      user.id,
      otherUserId,
      annonceId,
    );
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Nombre de messages non lus' })
  countUnread(@CurrentUser() user: any) {
    return this.messagesService.countUnread(user.id);
  }
}