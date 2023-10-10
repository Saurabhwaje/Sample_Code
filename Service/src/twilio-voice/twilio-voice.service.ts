// import { Injectable } from '@nestjs/common';
// import * as Twilio from 'twilio';
// // import { Capability } from 'twilio'

// @Injectable()
// export class TwilioService {
//   private client: Twilio.Twilio;

//   constructor() {
//     this.client = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
//   }

//   generateCapabilityToken(clientName: string): string {
//     const capability = new Capability.TwilioCapability({
//       accountSid: process.env.TWILIO_ACCOUNT_SID,
//       authToken: process.env.TWILIO_AUTH_TOKEN,
//     });
  
//     capability.addScope(new Capability.OutgoingClientScope('APxxxxxxxx'));
//     capability.addScope(new Capability.IncomingClientScope(clientName));
  
//     return capability.toJwt();
//   }

  
// }





// // import twilio from 'twilio';

// // const accountSid = 'YOUR_TWILIO_ACCOUNT_SID';
// // const authToken = 'YOUR_TWILIO_AUTH_TOKEN';
// // const twilioPhoneNumber = 'YOUR_TWILIO_PHONE_NUMBER';

// // // Generate an access token
// // const accessToken = new twilio.jwt.AccessToken(accountSid, apiKey, secret);

// // // Set the identity of the user
// // accessToken.identity = 'USER_IDENTITY';

// // // Create a Voice grant and add it to the access token
// // const voiceGrant = new twilio.jwt.AccessToken.VoiceGrant();
// // accessToken.addGrant(voiceGrant);

// // // Generate the token and return it to the client
// // const token = accessToken.toJwt();





// // import { Injectable } from '@nestjs/common';
// // import * as twilio from 'twilio';

// // @Injectable()
// // export class TwilioVoiceService {
// //   private client: twilio.Twilio;

// //   constructor() {
// //     this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
// //     console.log(process.env.TWILIO_ACCOUNT_SID);
// //   }

// //   async makeVoiceCall(from: string, to: string, twimlUrl: string): Promise<void> {
// //     await this.client.calls.create({
// //       from: from,
// //       to: to,
// //       url: twimlUrl,
// //     });
// //   }
// // }
