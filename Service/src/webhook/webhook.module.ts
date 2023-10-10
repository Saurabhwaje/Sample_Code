import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupEntity } from './shared/entity/questions';
import { User } from 'src/user.entity';
import { Userconv } from 'src/twilio-concersation/userConvDetails.entity';2
// import { SocketGateway } from 'src/twilio-concersation/ChatGateway';
import { MailerModule } from '@nestjs-modules/mailer';
import { SocketGatewayWebHook } from './ChatGatewayWebook';

@Module({
  imports: [MailerModule,TypeOrmModule.forFeature([GroupEntity,User,Userconv])],
  controllers: [WebhookController],
  providers: [WebhookService,SocketGatewayWebHook],
  exports: [WebhookService],
})
export class WebhookModule { 
}
