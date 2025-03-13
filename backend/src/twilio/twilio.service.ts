import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';
import AccessToken = require('twilio/lib/jwt/AccessToken');

@Injectable()
export class TwilioService {
  private readonly client: twilio.Twilio;
  private readonly accountSid: string;
  private readonly authToken: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    this.authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.apiKey = this.configService.get<string>('TWILIO_API_KEY');
    this.apiSecret = this.configService.get<string>('TWILIO_API_SECRET');
    
    this.client = twilio(this.accountSid, this.authToken);
  }

  async createRoom(roomName: string): Promise<string> {
    try {
      const room = await this.client.video.v1.rooms.create({
        uniqueName: roomName,
        type: 'group',
      });
      return room.sid;
    } catch (error) {
      throw new Error(`Failed to create Twilio room: ${error.message}`);
    }
  }

  async endRoom(roomSid: string): Promise<void> {
    try {
      await this.client.video.v1.rooms(roomSid).update({ status: 'completed' });
    } catch (error) {
      throw new Error(`Failed to end Twilio room: ${error.message}`);
    }
  }

  generateToken(identity: string, roomName: string): string {
    const token = new AccessToken(
      this.accountSid,
      this.apiKey,
      this.apiSecret,
      { identity }
    );

    const videoGrant = new AccessToken.VideoGrant({
      room: roomName,
    });

    token.addGrant(videoGrant);
    return token.toJwt();
  }
} 