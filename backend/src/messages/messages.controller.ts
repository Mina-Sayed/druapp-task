import { Controller, Get, Post, Body, Param, UseGuards, Request, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';

@ApiTags('messages')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async create(@Request() req, @Body() createMessageDto: CreateMessageDto) {
    return this.messagesService.create(req.user.id, createMessageDto);
  }

  @Get('conversations')
  async findUserConversations(@Request() req) {
    return this.messagesService.findUserConversations(req.user.id);
  }

  @Get('conversations/:userId')
  async findConversation(@Request() req, @Param('userId') otherUserId: string) {
    const messages = await this.messagesService.findConversation(req.user.id, otherUserId);
    // Mark messages as read when conversation is opened
    await this.messagesService.markConversationAsRead(req.user.id, otherUserId);
    return messages;
  }

  @Put(':messageId/read')
  async markAsRead(@Request() req, @Param('messageId') messageId: string) {
    return this.messagesService.markAsRead(messageId, req.user.id);
  }
} 