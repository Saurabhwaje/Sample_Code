import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from "cookie-parser";
import { IoAdapter } from '@nestjs/platform-socket.io';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { Server } from 'socket.io';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const httpAdapter = app.getHttpAdapter();

  app.use(cookieParser());

  const corsOptions: CorsOptions = {
    origin: ['http://localhost:4200','*'],
    credentials: true,
  };

  app.enableCors(corsOptions);

  const server = httpAdapter.getHttpServer();
  const io = new Server(server, {
    cors: {
      origin: ['http://localhost:4200','*'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });
  
  io.on('connect', (socket: any) => {
    console.log('WebSocket connection opened');
  });

  app.useWebSocketAdapter(new IoAdapter(server));

 

  // Add the following middleware to set the Access-Control-Allow-Origin header
  app.use(bodyParser.json({ limit: '50mb' }),
  (req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.header('Access-Control-Allow-Methods', 'GET, POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
  });

  await app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
}

bootstrap();