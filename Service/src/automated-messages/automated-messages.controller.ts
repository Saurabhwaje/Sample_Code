import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AutomatedMessagesService } from './automated-messages.service';
import { HttpService } from '@nestjs/axios';
import { map } from 'rxjs/operators';
import { Message } from 'twilio/lib/twiml/MessagingResponse';
import { User } from 'src/user.entity';
import { UserDetails } from './UserDetails.entity';

@Controller('automated-messages')
export class AutomatedMessagesController {
 
  private dialogflowUrl = 'https://dialogflows******************/chat-df-agent';

  constructor(private AutomatedMessagesService:AutomatedMessagesService,private httpService: HttpService) { }

  @Post('auto-msg')
  async sendMessage(@Body() Body: any) {
    console.log(Body);
    const result = await this.AutomatedMessagesService.processMessage(Body.From, Body.Body);
    return { message: result };
  }

  @Post('save-user-details')
  async createXyz(@Body() data: any): Promise<UserDetails> {
    console.log("save-user-details");
    //console.log(JSON.stringify(data));
    const data1 = data.sessionInfo.parameters;
    return this.AutomatedMessagesService.saveUserDetails(data1);
  }

  @Post('update-contact')
  async updatePhoneNumber(@Body() Body: any) {
    console.log(Body);
    const result = await this.AutomatedMessagesService.updatePhoneNumber(Body.From, Body.Body);
    return { message: result };
  }
}
