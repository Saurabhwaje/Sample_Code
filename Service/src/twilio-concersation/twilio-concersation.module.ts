import { Module } from '@nestjs/common';
import { TwilioConcersationService } from './twilio-concersation.service';
import { TwilioConcersationController } from './twilio-concersation.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationDetails } from './twilio-concersation.entity';
import { Userconv } from './userConvDetails.entity';
import { SocketGateway } from 'src/twilio-concersation/ChatGateway';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [MulterModule.register({
    dest: './uploads',
  }),HttpModule, TypeOrmModule.forFeature([ConversationDetails, Userconv])],
  controllers: [TwilioConcersationController],
  providers: [TwilioConcersationService, SocketGateway]
})
export class TwilioConcersationModule { }
