import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Twilio from 'twilio';

@Injectable()
export class TwilioService {
  private twilioClient: Twilio.Twilio;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.twilioClient = Twilio(accountSid, authToken);
  }

  async generateToken(identity: string, roomName: string): Promise<string> {
    const AccessToken = Twilio.jwt.AccessToken;
    const VideoGrant = AccessToken.VideoGrant;

    // Create Video Grant
    const videoGrant = new VideoGrant({
      room: roomName,
    });

    // Create an access token
    const token = new AccessToken(
      this.configService.get<string>('TWILIO_ACCOUNT_SID'),
      this.configService.get<string>('TWILIO_API_KEY'),
      this.configService.get<string>('TWILIO_API_SECRET'),
      { identity }
    );

    // Add the video grant to the token
    token.addGrant(videoGrant);

    // Serialize the token and return it
    return token.toJwt();
  }

  async createRoom(roomName: string): Promise<any> {
    try {
      const room = await this.twilioClient.video.v1.rooms.create({
        uniqueName: roomName,
        type: 'group',
        recordParticipantsOnConnect: false,
      });
      return room;
    } catch (error) {
      if (error.code === 53113) {
        // Room already exists
        return await this.twilioClient.video.v1.rooms(roomName).fetch();
      }
      throw error;
    }
  }
} 