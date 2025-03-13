import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './messages.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(senderId: string, createMessageDto: CreateMessageDto): Promise<Message> {
    const sender = await this.usersRepository.findOne({ where: { id: senderId } });
    const receiver = await this.usersRepository.findOne({ where: { id: createMessageDto.receiverId } });

    if (!sender || !receiver) {
      throw new NotFoundException('User not found');
    }

    const message = this.messagesRepository.create({
      content: createMessageDto.content,
      sender,
      receiver,
      read: false,
    });

    return this.messagesRepository.save(message);
  }

  async findConversation(userId: string, otherUserId: string): Promise<Message[]> {
    return this.messagesRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .where(
        '(message.sender_id = :userId AND message.receiver_id = :otherUserId) OR ' +
        '(message.sender_id = :otherUserId AND message.receiver_id = :userId)',
        { userId, otherUserId }
      )
      .orderBy('message.createdAt', 'ASC')
      .getMany();
  }

  async findUserConversations(userId: string): Promise<any[]> {
    const conversations = await this.messagesRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .where('message.sender_id = :userId OR message.receiver_id = :userId', { userId })
      .orderBy('message.createdAt', 'DESC')
      .getMany();

    // Group messages by conversation partner
    const conversationMap = new Map();
    
    conversations.forEach(message => {
      const otherUser = message.sender.id === userId ? message.receiver : message.sender;
      const conversationKey = otherUser.id;
      
      if (!conversationMap.has(conversationKey)) {
        conversationMap.set(conversationKey, {
          user: {
            id: otherUser.id,
            name: otherUser.name,
            role: otherUser.role
          },
          lastMessage: {
            id: message.id,
            content: message.content,
            sender: {
              id: message.sender.id,
              name: message.sender.name
            },
            receiver: {
              id: message.receiver.id,
              name: message.receiver.name
            },
            read: message.read,
            createdAt: message.createdAt
          },
          unreadCount: message.receiver.id === userId && !message.read ? 1 : 0
        });
      } else if (message.receiver.id === userId && !message.read) {
        conversationMap.get(conversationKey).unreadCount++;
      }
    });

    return Array.from(conversationMap.values());
  }

  async markAsRead(messageId: string, userId: string): Promise<Message> {
    const message = await this.messagesRepository.findOne({ 
      where: { id: messageId, receiver: { id: userId } },
      relations: ['sender', 'receiver']
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    message.read = true;
    return this.messagesRepository.save(message);
  }

  async markConversationAsRead(userId: string, otherUserId: string): Promise<void> {
    await this.messagesRepository
      .createQueryBuilder()
      .update(Message)
      .set({ read: true })
      .where('receiver_id = :userId AND sender_id = :otherUserId AND read = false', { userId, otherUserId })
      .execute();
  }
} 