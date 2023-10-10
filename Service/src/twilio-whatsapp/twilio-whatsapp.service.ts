import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

@Injectable()
export class TwilioWhatsappService {
  private client: Twilio;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get('TWILIO_AUTH_TOKEN'); // Use configService to get the auth token
    this.client = new Twilio(accountSid, authToken); // Assign the created Twilio client to the class property
  }

  async forwardCallToWhatsApp(fromNumber: string, toWhatsAppNumber: string): Promise<void> {
    const message = `Call received from ${fromNumber}`;
    const from = 'whatsapp:+14****8886'; // This is the Twilio Sandbox number

    try {
      await this.client.messages.create({
        body: message,
        from,
        to: `whatsapp:${toWhatsAppNumber}`,
      });
    } catch (error) {
      console.error(`Error sending message: ${error}`);
      throw error;
    }
  }
}
