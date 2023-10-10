import { Module } from '@nestjs/common';
import { AutomatedMessagesService } from './automated-messages.service';
import { AutomatedMessagesController } from './automated-messages.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { UserDetails } from './UserDetails.entity';

@Module({
  controllers: [AutomatedMessagesController],
  providers: [AutomatedMessagesService],
  imports: [HttpModule,
    TypeOrmModule.forFeature([Message,UserDetails])
  ]

})
export class AutomatedMessagesModule { }
