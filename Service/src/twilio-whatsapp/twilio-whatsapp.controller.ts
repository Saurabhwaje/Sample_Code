import { Body, Controller, Post } from '@nestjs/common';
import { TwilioWhatsappService } from './twilio-whatsapp.service';

@Controller('twilio-whatsapp')
export class TwilioWhatsappController {
  constructor(private readonly twilioWhatsappService: TwilioWhatsappService) {}

  @Post('forward')
  async forwardCall(@Body('From') fromNumber: string): Promise<string> {
    const toWhatsAppNumber = '+917588553476'; // WhatsApp number you want to send the message to

    try {
      await this.twilioWhatsappService.forwardCallToWhatsApp(fromNumber, toWhatsAppNumber);
      return 'Call forwarded to WhatsApp';
    } catch (error) {
      console.error(`Error forwarding call: ${error}`);
      throw error;
    }
  }
}
