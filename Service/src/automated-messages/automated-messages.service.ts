import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { map } from 'rxjs/operators';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';

import { Connection, Repository } from 'typeorm';
import { Message } from './message.entity';
import { User } from 'src/user.entity';
import { UserDetails } from './UserDetails.entity';

@Injectable()
export class AutomatedMessagesService {


  currentMessage = "";
  currentQuestion = '';

  constructor(private readonly httpService: HttpService,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(UserDetails)
    private readonly UserDetailsRepository: Repository<UserDetails>,
    // @InjectRepository(User)
    // private readonly UserRepository: Repository<User>,
  ) { }

  // Saving User Details to the UserDetails Table
  async saveUserDetails(data: any): Promise<UserDetails> {
    const existingUser = await this.UserDetailsRepository.findOne({
      where: { UserMobile: data['phone-number'] },
    });

    if (existingUser) {
      //const name = data.person.name;
      existingUser.Name = data.person.name;
      existingUser.Height = data['user-body-height'];
      existingUser.Weight = data.user_body_weight;

      const updatedUser = await this.UserDetailsRepository.save(existingUser);
      console.log("User details are successfully updated");
      return updatedUser;
    } else {
      const name = data.person.name;
      const phoneNumber = data['phone-number'];
      const height = data['user-body-height'];
      const weight = data.user_body_weight;

      const userDetails = this.UserDetailsRepository.create({
        Name: name,
        UserMobile: phoneNumber,
        Height: height,
        Weight: weight,
      });

      const updatedUser = await this.UserDetailsRepository.save(userDetails);
      console.log("User details are successfully added");
      return userDetails;
    }
  }

  // DialogFlowService Automated messages ->
  async processMessage(From: string, Body: string): Promise<string> {
    
    const url = 'https://dialogflowse*****************o/chat-df-agent'; 

    const requestBody = {
      From: From,
      Body: Body,
    };

    // this.currentMessage = Body;

    const response = await this.httpService.post(url, requestBody).toPromise();
    console.log(response.data);

    return response.data;
  }

  async updatePhoneNumber(From: string, Body: string): Promise<string> {
    try{
    console.log("In the update phone number");
    const url = 'https://dialogflowse***************io/chat-initiate-from-df'; //

    const requestBody = {
      From: "Dialogflow",      
      Body: Body,
      DfObject: {
        contexts: {
          msg: Body,
        },
      }
    };

    // this.currentMessage = Body;

    const response = await this.httpService.post(url, requestBody).toPromise();
    console.log(response.data);
    return response.data;
  }
  catch(error){
    console.log(">>>>>> ",error)
  }
  }
}
