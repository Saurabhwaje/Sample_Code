import * as fs from 'fs';
import { Body, Controller, Get, HttpException, HttpStatus, InternalServerErrorException, NotFoundException, Param, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { TwilioConcersationService } from './twilio-concersation.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Userconv } from './userConvDetails.entity';
import { Not, Repository } from 'typeorm';
import { FileInterceptor } from '@nestjs/platform-express';
// import { TwilioConcersationService } from './Twil';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { diskStorage } from 'multer';
import { extname, join } from 'path';
// import multer from 'multer';
// import { Express } from 'express';
import { Multer } from 'multer';
// import axios from 'axios';
// import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
// import { UploadedFile } from 'nestjs-typeorm';
// import * as path from 'path';

@Controller('twilio')
export class TwilioConcersationController {
  constructor(private readonly twilioService: TwilioConcersationService,
    @InjectRepository(Userconv)
    private socketRepository: Repository<Userconv>) { }

  @Get('conversions')
  async getTwilioConversions(@Query() reqParam: string) {
    const response = await this.twilioService.logConversions(reqParam);
    return response;
  }

  @Get('listconversions')
  async getTwilioConversionsList() {
    const response = await this.twilioService.listConversions();
    return response;
  }

  @Get('listAllconversionDetails')
  async listAllConversations() {
    const response = await this.twilioService.ListAllConversationDetails();
    return response;
  }

  @Post('mnbv')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Multer.File) {
    // Process the file as per your requirements
    console.log("FILE :", file);
    // Save the file, perform validations, etc.
    return { message: 'File uploaded successfully' };
  }

  @Post('create')
  async createConversation(@Body() body: any) {
    let { CommunicationType, sourceUser, targetUser, messageBody, sourceUserName, targetUserName, conversionId, socketId, CommunicationMode, Media } = body;
    console.log("Body>>", body);

    if (body.Media) {
      try {
        const fileName = body.Media.fileName;
        const base64Data = body.Media.base64Data;

        // Convert base64 data to a Buffer
        const buffer = Buffer.from(base64Data, 'base64');
        console.log("BUFFER >> ", buffer);

        // Create a Blob from the Buffer
        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        console.log("BLOB >> ", blob);

        // Define the file path
        const filePath = join(__dirname, '../../uploads', fileName);


        // Write the buffer data to the file
        const writeStream = fs.createWriteStream(filePath);
        writeStream.write(buffer);
        writeStream.end();

        const response = await this.twilioService.createConversation(
          CommunicationType,
          sourceUser,
          targetUser,
          messageBody,
          sourceUserName,
          targetUserName,
          conversionId,
          socketId,
          CommunicationMode,
          blob
        );
        return response;

      } catch (error) {
        console.error('Error uploading file:', error);
        throw new InternalServerErrorException('File upload failed');
      }
    } else {
      console.log("NO MEDIA ATTACHED");

      const response = await this.twilioService.createConversation(
        CommunicationType,
        sourceUser,
        targetUser,
        messageBody,
        sourceUserName,
        targetUserName,
        conversionId,
        socketId,
        CommunicationMode,
        undefined
      );
      return response;
    }
  }

  @Post('sendTextMessage')
  async sendTextMessage(@Body() body: any) {
    let { messageBody, sourceUserName, targetUserEmail, conversionId, contactNo, targetUserName, CommunicationMode } = body;
    console.log("SEND TEXT MESSAGE", body);
    const response = await this.twilioService.sendTextMessage(
      messageBody, sourceUserName, targetUserEmail, conversionId, contactNo, targetUserName, CommunicationMode
    );
    return response;
  }

  @Post('save-socketid')
  async saveSocketId(@Body() data: { name: string; socketId: string }) {
    const { name, socketId } = data;

    let socket = await this.socketRepository.findOne({ where: { name: name } });

    if (socket) {
      // Update the existing socket with the new socketId
      socket.socketId = socketId;
      await this.socketRepository.save(socket);
      console.log("Socket is Updated");
    } else {
      // Create a new socket
      socket = this.socketRepository.create({ name, socketId });
      await this.socketRepository.save(socket);
      console.log("Socket ID saved successfully.");
    }

    // Remove duplicate entries
    const duplicateSockets = await this.socketRepository.find({ where: { name: name, socketId: Not(socketId) } });
    await this.socketRepository.remove(duplicateSockets);

    return { message: 'Socket ID saved successfully.' };
  }

  // GET CONVERSATIONID 
  @Get('getConvId/:sourceUser/:targetUser')
  async getConversationId(
    @Param('sourceUser') sourceUser: string,
    @Param('targetUser') targetUser: string,
  ): Promise<string> {
    return this.twilioService.getConvId(sourceUser, targetUser);
  }

  @Get('users/:name/online-status')
  async getOnlineStatus(@Param('name') name: string): Promise<boolean> {
    return this.twilioService.getUserOnlineStatus(name);
  }

  @Get('/:id')
  get(@Param() params) {
    console.log("Reached here");
    return this.twilioService.getSingleUser(params.id);
  }
}
