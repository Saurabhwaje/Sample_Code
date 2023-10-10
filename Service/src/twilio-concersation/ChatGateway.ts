import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Userconv } from './userConvDetails.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

const config = {
  cors: {
    origin: ['http://localhost:4200', '*'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  withCredentials: true,
};

@WebSocketGateway(config) //{ cors: { origin: '*' } }
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private socket: Socket;

  constructor(
    @InjectRepository(Userconv)
    private userRepository: Repository<Userconv>,
  ) { }

  async handleConnection(client: Socket, name: string) {
    console.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    const user = await this.userRepository.findOne({ where: { socketId: client.id } });
    if (user) {
      // Remove the user entry from the userRepository
      await this.userRepository.remove(user);

      try {
        // Remove the socket entry from the socketRepository
        const socket = await this.userRepository.findOne({ where: { name: user.name } });
        if (socket) {
          await this.userRepository.remove(socket);
          console.log(`Socket with ID ${socket.socketId} removed from the database`);
        }
      }
      catch (error) {
        console.log("Error :", error);
      }
      console.log(`User ${user.name} with socketId ${user.socketId} removed from the database`);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, data: { content: string, from: string, to: string }) {
    console.log('Message received: ', data);
    console.log('Target User:', data.to);

    const user = await this.userRepository.findOne({ where: { name: data.to } });

    if (user) {
      const targetSocket = this.server.sockets.sockets.get(user.socketId);
      console.log("test >>> ", data.content + ", " + data.to + ", " + user.socketId);
      if (targetSocket) {
        // Send the message to the target user with sender information
        console.log("TargetSocketid");
        targetSocket.emit('receiveMessage', {
          content: data.content,
          from: data.from,
          to: data.to
        });
      } else {
        console.error(`Socket with ID ${user.socketId} not found`);
      }
    } else {
      console.log("NO SOCKETID FOUND");
    }

  }

  afterInit(server: Server) {
    console.log('Socket server initialized');
  }
}