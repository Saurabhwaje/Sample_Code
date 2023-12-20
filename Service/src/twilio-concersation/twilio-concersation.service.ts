//import { HttpService } from '@nestjs/axios/dist/http.service';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { createPool, Pool, PoolConnection, RowDataPacket } from 'mysql2/promise';
import { ConversationDetails } from './twilio-concersation.entity';
import { FindManyOptions, Repository } from 'typeorm';
import { SocketGateway } from './ChatGateway';
import { Userconv } from './userConvDetails.entity';
import { stringify } from 'querystring';
// import { SocketGateway } from 'src/socket.gateway';
// import { WebhookModule } from 'src/webhook/webhook.module';
// import { Userconv } from './userConvDetails.entity';
// import { ConversationGateway } from './ChatGateway';
const fs = require('fs');
import * as blobUtil from 'blob-util';


@Injectable()
export class TwilioConcersationService {
    private pool: Pool;
    //private io: Server;
    private params : any;

    constructor(private httpService: HttpService,
        private socketgateway: SocketGateway,
        @InjectRepository(ConversationDetails)
        private conversationDetailsRepository: Repository<ConversationDetails>,
        @InjectRepository(Userconv)
        private userConvRepository: Repository<Userconv>,
    ) {
        this.pool = createPool({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'test_forms',
            port: 3306,
            waitForConnections: true,
        });
        }

    private conversationData: string;
    private messageDetails: string;

    private userConId = 'CH0b7**********2a08a5753';
    private twilioUrlParticipantList = 'https://conve*******.com/v1/Conversations/' + this.userConId + '/Participants?PageSize=20';
    //private twilioUrlConversionMessage = 'https://conversat**********onversations/' + this.userConId + '/Messages?Order=desc';
    private twilioUrlCreateConversation = 'https://coffee-gi********l.io/TW_c***********tion';
    private listAllCOnversationDetails = 'https://conv*******om/v1/Cv**********ns';
    private readonly username = ;
    private readonly password = ;


    // GETTING THE MESSAGES LIST BASED ON THE COVERSATION ID
    async logConversions(reqParam) {
        console.log("requested Param ", reqParam.conversionId);
        const logData = [];
        const twilioUrlConversionMessage = 'https://convers**********om/v1/Con**********ns/' + reqParam.conversionId + '/Messages?PageSize=300&Order=asc';
        try {
            const response = await axios.get(twilioUrlConversionMessage, {
                auth: {
                    username: this.username,
                    password: this.password,
                },
            });
            for (let i = 0; i < response.data.messages.length; i++) {
                const message = response.data.messages[i];
                const logEntry = {
                    index: message.index,
                    author: message.author,
                    body: message.body,
                    date_updated: message.date_updated,
                    media: message.media,
                    participant_sid: message.participant_sid,
                    conversation_sid: message.conversation_sid,
                    delivery: message.delivery,
                    date_created: message.date_created,
                    sid: message.sid,
                    links: message.links,
                    mediaUrl: null // Add mediaUrl property with initial value as null
                };
                console.log("logEntry: ", logEntry);

                // Check if the message has media attachments
                if (message.media && message.media.length > 0) {
                    console.log("MEDIA::::");
                    for (let j = 0; j < message.media.length; j++) {
                        const mediaUrl = message.media[j].url;
                        logEntry.mediaUrl = mediaUrl; // Assign mediaUrl to logEntry object
                        console.log("Media URL: ", mediaUrl);
                    }
                }

                logData.push(logEntry);
                console.log("Body: ", response.data.messages[i].body, ",     \nAuthor: ", response.data.messages[i].author, "\nParticipant_Sid: ", response.data.messages[i].participant_sid, + "\n\n");
            }
        } catch (error) {
            console.error(error);
        }
        return logData;
    }
    // END logConversions() -------


    // START listConversions()  -----
    async listConversions() {
        const logData = [];
        try {
            const response = await axios.get(this.twilioUrlParticipantList, {
                auth: {
                    username: this.username,
                    password: this.password,
                },
            });
            for (let i = 0; i < response.data.participants.length; i++) {
                const logEntry = {
                    body: response.data.participants[i].conversation_sid,
                    author: response.data.participants[i].identity
                };
                logData.push(logEntry);
                console.log("Conversation Id: ", response.data.participants[i].conversation_sid, ",     \nAuthors: ", response.data.participants[i].identity + "\n");
            }
        } catch (error) {
            console.error(error);
        }
        return logData;
    }
    // END listConversions()  -----

    // LIST ALL CONVERSATION DETAILS
    async ListAllConversationDetails() {
        try {
            const response = await axios.get(this.listAllCOnversationDetails, {
                auth: {
                    username: this.username,
                    password: this.password,
                },
            });
            return response.data;
        } catch (error) {
            console.error(error);
        }
    }

    // TO GET CONVERSATIONID BASED ON SOURCEUSER AND TARGET USER.
    async getConvId(sourceUser: string, targetUser: string): Promise<any> {
        try {
            const sourceUserId = parseInt(sourceUser);
            const targetUserId = parseInt(targetUser);

            const options: FindManyOptions<ConversationDetails> = {
                select: ['conversationId', 'sourceParticipanSid', 'tergetParticipanSid', 'sourceUserId', 'targetUserId'],
                where: [
                    { sourceUserId: sourceUserId, targetUserId: targetUserId },
                    { sourceUserId: targetUserId, targetUserId: sourceUserId }
                ]
            };
            const conversationDetails = await this.conversationDetailsRepository.findOne(options);
            return {
                conversationId: conversationDetails.conversationId,
                sourceParticipanSid: conversationDetails.sourceParticipanSid,
                tergetParticipanSid: conversationDetails.tergetParticipanSid,
                sourceUser: conversationDetails.sourceUserId,
                targetUser: conversationDetails.targetUserId
            };
        } catch (error) {
            console.log("No conversation id found.");
            return "No conversation id found. Please create a new conversation.";
        }
    }

    async getConversionIdFromDatabase(sourceUser, targetUser) {
        const options: FindManyOptions<ConversationDetails> = {
            select: ['conversationId'],
            where: [
                { sourceUserId: sourceUser, targetUserId: targetUser },
                { sourceUserId: targetUser, targetUserId: sourceUser }
            ]
        };
        const conversationDetails = await this.conversationDetailsRepository.findOne(options);
        return conversationDetails ? conversationDetails.conversationId : null;
    }

    async sendTextMessage(
        messageBody: string,
        sourceUserName: string,
        targetUserEmail: string,
        conversionId: string,
        contactNo: string,
        targetUserName: string,
        CommunicationMode: string
    ) {
        const data = {
            messageBody,
            sourceUserName,
            targetUserEmail,
            conversionId,
            contactNo,
            from: process.env.TWILIO_OFFLINE_MESSAGES,
            targetUserName,
            sourceUserEmail: process.env.TWILIO_OFFLINE_MESSAGES_EMAIL,
            CommunicationMode
        };

        // const params = new URLSearchParams(data).toString();
        let url = "https://coffe***********.io/off*********ge";

        const params = new URLSearchParams();
        params.append('Parameters', JSON.stringify(data));

        try {
            const response = await axios.post(url, params, {
                auth: {
                    username: this.username,
                    password: this.password,
                },
            });
            console.log("Response", response);
        } catch (error) {
            console.log(error);
        }
    }


    // CREATE CONVERSATION FUNCTION
    async createConversation(
        CommunicationType: string,
        sourceUser: string,
        targetUser: string,
        messageBody: string,
        sourceUserName: string,
        targetUserName: string,
        conversionId: string,
        socketId: string,
        CommunicationMode: string,
        Media: Blob | undefined
    ) {

        // Check the conversionId in the database based on the sourceUser and targetUser
        const existingConversionId = await this.getConversionIdFromDatabase(sourceUser, targetUser);

        // If the conversionId is found, update it
        if (existingConversionId) {
            conversionId = existingConversionId;
        } else {
            console.log("Final check -> no conversionId found.");
        }
        // const blob = blobUtil.base64StringToBlob(Media.media, Media.contentType);


        if (Media) {
            console.log(">>>  <<<<");

            const data = {
                CommunicationType,
                sourceUser,
                targetUser,
                messageBody,
                sourceUserName,
                targetUserName,
                conversionId,
                socketId,
                CommunicationMode,
                Media
                // Include the socket ID in the message payload
                //Status > Online/ offline -> boolean / 01
                // Communication mode -> web, text, email
            };

            const params = new URLSearchParams();
            params.append('Parameters', JSON.stringify(data));
            this.params = params;
        } else {
            console.log("twilio conv -> NO MEDIA");
    
            const data = {
                CommunicationType,
                sourceUser,
                targetUser,
                messageBody,
                sourceUserName,
                targetUserName,
                conversionId,
                socketId,
                CommunicationMode
            };
            const params = new URLSearchParams();
            params.append('Parameters', JSON.stringify(data));
            this.params = params;
        }

        if (conversionId && conversionId.startsWith('CH', 0) && conversionId.length >= 32) {

            this.params.append('conversationId', conversionId);
            console.log("\n conversationId", conversionId + "\n");

            console.log("PARAMS WE GOT >>>",this.params);

        } else if (!conversionId) {
            console.log("\n No conversationId given! \n");
        } else {
            console.log("\n Wrong Id Entered! \n");
        }

        try {
            const response = await axios.post(this.twilioUrlCreateConversation, this.params, { // params
                auth: {
                    username: this.username,
                    password: this.password,
                },
                withCredentials: true,  // NEW LINE ADDED ----- TODO
            });

            // Clear existing after post
            this.params = "";

            console.log("Response", response);
            this.conversationData = response.data;

            console.log("OUT SOCKET ID", socketId);

            if (socketId) {
                console.log("IN SOCKET ID", socketId);
                // Retrieve the Socket object for the specified socket ID                
                const data = { content: messageBody, from: sourceUserName, to: targetUserName, socketId };
                this.socketgateway.handleMessage(null, data);
            }

            let convsid;
            if (typeof response.data !== 'undefined' && response.data !== null) {
                if (response.data.messageDetails) {
                    console.log("Im in the 1st stmt", sourceUser, targetUser);
                    const sourceUserId = parseInt(sourceUser);
                    const targetUserId = parseInt(targetUser);

                    const existingConversationDetails = await this.conversationDetailsRepository.findOne(
                        {
                            where: [
                                { sourceUserId, targetUserId },
                                { targetUserId, sourceUserId }
                            ]
                        }
                    );
                    if (existingConversationDetails) {
                        console.log('Duplicate record found.');
                    } else {
                        const sourceUserId = parseInt(sourceUser);
                        const targetUserId = parseInt(targetUser);

                        const conversationDetails = new ConversationDetails();
                        conversationDetails.conversationId =
                            response.data.conversactioninfo.conversationSid;
                        conversationDetails.sourceUserId = sourceUserId;
                        conversationDetails.targetUserId = targetUserId;
                        conversationDetails.sourceUserName = sourceUserName;
                        conversationDetails.targetUserName = targetUserName;
                        conversationDetails.sourceParticipanSid = response.data.sourceUserParticipantInfo.sid;
                        conversationDetails.tergetParticipanSid = response.data.targetUserParticipantInfo.sid;

                        const savedConversationDetails = await this.conversationDetailsRepository.save(
                            conversationDetails
                        );
                        console.log('Data inserted into database.', savedConversationDetails);
                    }
                } else {
                    if (Object.keys(response.data).length > 0) {
                        convsid = response.data.conversactioninfo.conversationSid;

                        const sourceUserId = parseInt(sourceUser);
                        const targetUserId = parseInt(targetUser);

                        const conversationDetails = new ConversationDetails();
                        conversationDetails.conversationId = convsid;
                        conversationDetails.sourceUserId = sourceUserId;
                        conversationDetails.targetUserId = targetUserId;
                        conversationDetails.sourceUserName = sourceUserName;
                        conversationDetails.targetUserName = targetUserName;
                        conversationDetails.sourceParticipanSid = response.data.sourceUserParticipantInfo.sid;
                        conversationDetails.tergetParticipanSid = response.data.targetUserParticipantInfo.sid;

                        const savedConversationDetails = await this.conversationDetailsRepository.save(
                            conversationDetails
                        );
                        // await this.pool.query(
                        //     'INSERT INTO conversation_details (conversationId, sourceUser, targetUser) VALUES (?, ?, ?)',
                        //     [convsid, sourceUser, targetUser]
                        // );
                        console.log('Data inserted into database.');

                        // return responseData;
                    } else {
                        console.log('Response data is an empty object.');
                    }
                }
            } else {
                // If response data is null or undefined, query the database to check for duplicates
                // const result = await this.pool.query(
                //     `SELECT conversationId FROM conversation_details WHERE sourceUser = ? AND targetUser = ?`,
                //     [targetUser, sourceUser]
                // );
                console.log("Im in the 2nd stmt", sourceUser, targetUser);
                const sourceUserId = parseInt(sourceUser);
                const targetUserId = parseInt(targetUser);
                const existingConversationDetails = await this.conversationDetailsRepository.findOne(
                    {
                        where: [
                            { sourceUserId, targetUserId },
                            { targetUserId, sourceUserId }
                        ]
                    }
                );
                if (existingConversationDetails) {
                    console.log('Duplicate record found.');
                } else {
                    const conversationDetails = new ConversationDetails();
                    conversationDetails.conversationId =
                        response.data.conversactioninfo.conversationSid;
                    conversationDetails.sourceUserId = sourceUserId;
                    conversationDetails.targetUserId = targetUserId;
                    conversationDetails.sourceUserName = sourceUserName;
                    conversationDetails.targetUserName = targetUserName;
                    conversationDetails.sourceParticipanSid = response.data.sourceUserParticipantInfo.sid;
                    conversationDetails.tergetParticipanSid = response.data.targetUserParticipantInfo.sid;

                    const savedConversationDetails = await this.conversationDetailsRepository.save(
                        conversationDetails
                    );

                    // await this.pool.query(
                    //     'INSERT INTO conversation_details (conversationId, sourceUser, targetUser) VALUES (?, ?, ?)',
                    //     [response.data.conversactioninfo.conversationSid, sourceUser, targetUser] //, sourceUserName, targetUserName

                    // );
                    console.log('Data inserted into database.', savedConversationDetails);
                    //return this.conversationData;
                }
            }
        }
        catch (error) {
            console.error(error);
        }
        console.log(this.conversationData);
        return this.conversationData;
    }

    async getUserOnlineStatus(name: string): Promise<boolean> {
        const user = await this.userConvRepository.findOne({ where: { name } });
        if (user && user.socketId) {
            return true;
        }
        return false;
    }

    async getUserByUsername(username: string): Promise<Userconv | undefined> {
        return this.userConvRepository.findOne({ where: { name: username } });
    }

    async getSingleUser(name: string): Promise<Userconv[]> {
        let result = await this.userConvRepository.find({
            select: ["socketId"],
            where: [{ "name": name }]
        });
        console.log(result)
        return result;
    }

}

