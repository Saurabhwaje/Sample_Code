import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Userconv } from '../twilio-concersation/userConvDetails.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { json } from 'body-parser';

const config = {
    cors: {
        origin: ['http://localhost:4200','http://192.168.222.226:8080', '*'],
        methods: ['GET', 'POST'],
        credentials: true,
    },
    withCredentials: true,
};

@WebSocketGateway(config) //{ cors: { origin: '*' } }
export class SocketGatewayWebHook implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    private socket: Socket;

    constructor(
        @InjectRepository(Userconv)
        private userRepository: Repository<Userconv>,
    ) { }

    async handleConnection(client: Socket, name: string) {
    }

    async handleDisconnect(client: Socket) {
        // console.log(`Client disconnected: ${client.id}`);
        const user = await this.userRepository.findOne({ where: { socketId: client.id } });
        if (user) {
            // await this.userRepository.remove(user);
            // console.log(`User ${user.name} with socketId ${user.socketId} removed from database`);
        }
    }

    // The client parameter in the handleMessage method represents the Socket object for the client that sent the message.
    // The client parameter is optional, and you can use it to send a response message back to the client that sent the original message
    // 'sendMessage' will be get called when client sends the data
    @SubscribeMessage('sendMessage1')
    async handleMessage(client: Socket, data: { content: string, from: string, to: string, socketId: string }) {
        console.log('Message received:', data);
        // console.log('Target User:', data.to);
        const user = await this.userRepository.findOne({ where: { name: data.to } });
        if (user) {
            if (data.socketId) {
                // console.log(">>>>>>>>>>>>>>>>>>>>>>>>");
                // Send the message to the client with the specified socket ID.... Othersource -> client
                const socket = this.server.sockets.sockets.get(data.socketId);
                if (socket) {
                    socket.emit('receiveMessage', data);
                } else {
                    console.error(`Socket with ID ${data.socketId} not found`);
                }
            } else {
                // Regular flow client -> API -> client.
                this.server.to(user.socketId).emit('receiveMessage', data);
            }
        }
        // LIKE THIS WAY -> client.emit('dataResponse',result);
    }

    afterInit(server: Server) {
        console.log('Socket server initialized');
    }
}