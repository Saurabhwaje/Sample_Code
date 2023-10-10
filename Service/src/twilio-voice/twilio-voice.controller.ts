// import { Controller, Post, Body, Get, Res } from '@nestjs/common';
// import { TwilioVoiceService } from './twilio-voice.service';
// import { Response } from 'express';

// @Controller('twilio-voice')
// export class TwilioVoiceController {
//   constructor(private readonly twilioService: TwilioVoiceService) {}

//   @Get()
//   getTwiML(@Res() res: Response): void {
//     res.type('text/xml');
//     res.send(`
//       <Response>
//         <Say>Hello, this is a voice call from your app.</Say>
//       </Response>
//     `);
//   }

//   @Post('call')
//   async makeCall(@Body() body: { to: string }) {
//     const to = body.to;
//     const from = process.env.TWILIO_PHONE_NUMBER;
//     const url = `https://demo.twilio.com/welcome/voice/`;

//     return this.twilioService.makeVoiceCall(to, from, url);
//   }
// }
