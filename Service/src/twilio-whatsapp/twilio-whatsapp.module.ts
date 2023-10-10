import { Module } from '@nestjs/common';
import { TwilioWhatsappService } from './twilio-whatsapp.service';
import { TwilioWhatsappController } from './twilio-whatsapp.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { WebhookService } from 'src/webhook/webhook.service';

@Module({
  
  controllers: [TwilioWhatsappController],
  providers: [TwilioWhatsappService,ConfigService]
})
export class TwilioWhatsappModule {}
