import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
//import { forms_db } from './form/form.entity';
//import { FormModule } from './form/form.module';
import * as dotenv from 'dotenv';
import { SmsModule } from './sms/sms.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from '@hapi/joi';
import { JwtModule } from '@nestjs/jwt';
//import { JwtStrategy } from './JWT/auth/ABCD/jwt/jwt.service';
// import { AuthModule } from './JWT/auth/ABCD/auth.module';
// import { JwtStrategy } from './jwt.strategy';
// import { AuthModule } from './auth/auth.module';
//import { UsersModule } from './users/users.module';
//import { AuthModule } from './auth/auth.module';
//import { User } from './jwt-test-users/user.entity';
//import { JwtTestUsersModule } from './jwt-test-users/jwt-test-users.module';
//import { AuthService } from './auth/auth.service';
//import { ShowuseronlistModule } from './showuseronlist/showuseronlist.module';
import { User } from './user.entity';
//import { ChatWindowModule } from './chat-window/chat-window.module';
//import { ChatWindowService } from './chat-window/chat-window.service';
import { AutomatedMessagesModule } from './automated-messages/automated-messages.module';
// import { AuthOneModule } from './auth-one/auth-one.module';
// import { UsersModule } from './users/users.module';
import { TwilioConcersationModule } from './twilio-concersation/twilio-concersation.module';
import { ConversationDetails } from './twilio-concersation/twilio-concersation.entity';
import { Message } from './automated-messages/message.entity';
import { UserDetails } from './automated-messages/UserDetails.entity';
// import { SocketGateway } from './socket.gateway';
import { Userconv } from './twilio-concersation/userConvDetails.entity';
import { TwilioWhatsappModule } from './twilio-whatsapp/twilio-whatsapp.module';
// import { CorsMiddleware } from '@nestjs/platform-express';
// import { TwilioWhatsappModule } from './twilio-whatsapp/twilio-whatsapp.module';
import { WebhookModule } from './webhook/webhook.module';
import { MulterModule } from '@nestjs/platform-express';
// import { TwilioVoiceModule } from './twilio-voice/twilio-voice.module';


dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    MulterModule.register({
      dest: './uploads',
    }),
    SmsModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test_forms',
      entities: [User, ConversationDetails, Message, UserDetails, Userconv],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, ConversationDetails, Message, UserDetails, Userconv]),
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '1d' }
    }),
    AutomatedMessagesModule,
    TwilioConcersationModule,
    TwilioWhatsappModule,
    WebhookModule,
    // TwilioVoiceModule,
    // TwilioWhatsappModule,
    // AuthOneModule,
    // UsersModule,
    // ConfigModule.forRoot({
    //   validationSchema: Joi.object({
    //     TWILIO_ACCOUNT_SID: Joi.string(),
    //     TWILIO_AUTH_TOKEN: Joi.string(),
    //     //TWILIO_VERIFICATION_SERVICE_SID: Joi.string().required()
    //     // ...
    //   }),
    // }),
  ],
  controllers: [AppController],
  providers: [AppService], //JwtStrategy
})
export class AppModule {}
// implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer.apply(CorsMiddleware({
//       origin: 'http://localhost:4200',
//       methods: ['GET', 'POST'],
//       allowedHeaders: ['my-custom-header'],
//       credentials: true,
//     })).forRoutes('*');
//   }
// }
