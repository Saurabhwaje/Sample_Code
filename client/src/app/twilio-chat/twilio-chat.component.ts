import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Emitters } from '../emitters/emitters';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from './user.model';
import { NavigationExtras, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SocketService } from '../socket.service';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { catchError, filter, map, scan, switchMap } from 'rxjs/operators';
// import { FileReader } from '@angular/common';

@Component({
  selector: 'app-twilio-chat',
  templateUrl: './twilio-chat.component.html',
  styleUrls: ['./twilio-chat.component.css']
})
export class TwilioChatComponent implements OnInit {

  imageUrl: string | null = null;

  // WORKING 
  base64Data: string; 
  fileName: string
  mediaExist: boolean;

  selectedFile: File;
  isLoading: boolean = false;
  mediaOptions: any;
  mediaData: any;

  // authenticated = false;
  userName: any;
  testjson: string;
  lastSentMessage: any = null;
  commMode: string;
  isTextMessageSent: boolean = false;
  isEmailMessageSent: boolean = false;

  // Online status
  nextUser: string;
  nextUserOnline: boolean;
  isUserOnline: boolean;

  authenticated = false;
  refreshIntervalId: any;
  isCRHC: boolean = false;

  message = '';
  name = '';
  users: User[] | any;
  oneuser: "CRHC";
  currentUser: string;
  currentUserName: String;
  selectedUserName: String;
  otherUsers: User[];
  convmessages: [];
  CRHCID: string;

  selectedData: any;
  selectedId: any;
  convId: any;
  Body: string;
  messages: any[] = [];
  sourceParticipanSid: string;
  tergetParticipanSid: string;
  abc: string;
  msgData: string;

  listAllUrl = environment.baseUrl + '/twilio/listAllconversionDetails';
  // private allDataList: any;
  // private matchRec: any;

  messageData: any;
  // msgBody: String;
  messages$: Observable<any[]>;
  // userSocketDetails: string;
  // userSocketDetails: UserSocketDetails;

  @ViewChild('chatWindow') chatWindow: ElementRef;

  msgForm: FormGroup;

  constructor(private http: HttpClient, private router: Router, private fb: FormBuilder, private socketService: SocketService) {
    this.msgForm = this.fb.group({
      message: ''
    });
  }

  ngOnInit(): void {

    window.addEventListener('beforeunload', (event) => {
      console.log(">>>>>>>", event);
      event.preventDefault();
      this.http.get(environment.baseUrl + '/api/user', { withCredentials: true }).subscribe(
        (res: any) => {
          // const name = res.name;
          this.socketService.connect(res.name);
        },
        error => {
          console.log(error);
        }
      );
      event.returnValue = 'Are you sure you want to leave? you will be logged out.';
    });

    window.onbeforeunload = () => {
      return "If you refresh the page, you will be logged out.";
    };

    window.onunload = () => {
      this.http.post(environment.baseUrl + '/api/logout', {}, { withCredentials: true })
        .subscribe(() => {
          this.authenticated = false,
            this.userName = null
        }
        );
      // Redirect the user to the login page
      window.location.href = '/login';
    }

    // It will work with your session cookies "withCredentials() -> default value false"
    // GETTING THE CURRENTLY LOGIN USER.
    this.http.get(environment.baseUrl + '/api/user', { withCredentials: true }).pipe(
      switchMap((res: any) => {
        this.currentUser = res.id;
        this.currentUserName = res.name;
        console.log("1 ngoninit() currently logged in user ->", res.name);
        this.socketService.connect(res.name);
        Emitters.authEmitter.emit(true);
        return this.http.get<User[]>(environment.baseUrl + '/api/getalluserslist/?logginusername=a');
      })
    ).subscribe(users => {
      const currentUserID = parseInt(this.currentUser, 10);
      this.users = users.filter(user => user.id !== currentUserID);
      // Add the default user "CRHC"
      this.users.unshift({ id: 1234, name: 'CRHC' });
      console.log("Filtered users:", this.users);
    }, error => {
      this.message = 'You are not logged in';
      Emitters.authEmitter.emit(false);
    });

    Emitters.authEmitter.subscribe((auth: boolean) => {
      this.authenticated = auth;
    });

    this.socketService.receiveMessages().subscribe(
      (message) => {
        console.log("received message", message.content + "  " + this.selectedUserName + "  " + message.from + " " + message.to);
        if (message.from === this.selectedUserName || message.from === this.selectedData.name) {
          const apiMessage = {
            from: 'api',
            content: message.content
          };
          this.messages.push(apiMessage);
          this.scrollToBottom();
        }
      },
      (error) => {
        console.error('Error receiving messages:', error);
      }
    );
  }

  ngOnDestroy(): void {
    clearInterval(this.refreshIntervalId);
  }

  // getConvMEssages() {
  //   this.http.get(`http://localhost:3000/twilio/conversions/${this.convId}`).subscribe(
  //     (res: any) => {
  //       this.convmessages = res;
  //       console.log(res);
  //     }
  //   );
  //   console.log("I'm in the getConvMessages", this.convId);
  // }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    console.log("FILE SELECTED");
    // this.onUpload();
  }

  handleButtonClick() {
    if (!this.selectedFile) {
      console.log("NO FILE SELECTED");
      this.createConversationMessage();

      const message = this.msgForm.get('message')?.value;
      if (message === "" || message === null || message === undefined) {
        console.log("EMPTY MESSAGE");
      } else {
        this.messages.push({ content: message, from: 'user' });
        this.lastSentMessage = this.msgForm.get('message').value;
        this.sendMessage();
      }
    } else {
      console.log("FILE EXIST");
      // this.handleButtonClickUpload();
      this.createConversationMessage();
    }
  }

  async sendMessage() {
     const message = this.msgForm.get('message')?.value;
    if (this.CRHCID !== "1234") {
      console.log("sendMessage");
      this.socketService.sendMessage(
        message,
        this.currentUserName.toString(),
        this.selectedData.name.toString(),
      );
      console.log("SEND MESSAGE ", message + ",  " + this.currentUserName + ",  " + this.selectedData.name + ".");
    } else {
      // console.log("sendMessage 1");
      // this.socketService.sendMessage1(message, this.currentUser, this.selectedData.name);
    }
    this.msgForm.reset();
    this.message = '';
    this.scrollToBottom();
  }


  // TODO
  //TWILIO IN APP VOICE CALL
  makeVoiceCall(): void {
    this.http.post('/api/voice-call', {}).subscribe(
      () => {
        console.log('Voice call triggered successfully');
      },
      (error) => {
        console.error('Failed to trigger voice call', error);
      }
    );
  }

  // GET USER ONLINE STATUS BASED ON THE SOCKET ID
  getUserOnlineStatus(username: string): Observable<boolean> {
    const url = environment.baseUrl + `/twilio/users/${username}/online-status`;
    return this.http.get<boolean>(url);
  }


  async userHasSentMessage(): Promise<boolean> {
    console.log("MESSAGE DATA >>>>", this.messageData);

    console.log("userHasSentMessage");
    // Assuming the messages array contains objects with a 'from' property indicating the sender
    const lastUserMessageIndex = this.messages
      .slice()
      .reverse()
      .findIndex((message) => message.from === 'user');

    // If there are no user messages or the last user message is the most recent one, return false
    if (lastUserMessageIndex === -1 || lastUserMessageIndex === this.messages.length - 1) {
      return false;
    }

    // Check if there are any messages from the user after the last interaction
    const messagesAfterLastInteraction = this.messages.slice(lastUserMessageIndex + 1);
    const hasSentMessage = messagesAfterLastInteraction.some((message) => message.from === 'user');
    console.log("Message: ", hasSentMessage);
    return hasSentMessage;
  }

  sendMessageAfterOffline(): void {
    this.commMode = "text";
    console.log("????", this.commMode);
    console.log("Last sent message:", this.lastSentMessage);
    this.sendEmailTextMessge();
    this.isTextMessageSent = true;
  }

  sendEmailAfterOffline() {
    this.commMode = "email";
    this.sendEmailTextMessge();
    this.isEmailMessageSent = true;
  }

  checkUserOnlineStatus(username: string): void {
    console.log("username -> ... ", username);
    this.getUserOnlineStatus(username).subscribe(
      (response: boolean) => {
        this.isUserOnline = response;
        if (response) {
          console.log('User is online.');
        } else {
          console.log('User is offline.');
        }
      },
      (error) => {
        console.error('Error occurred while checking user online status:', error);
      }
    );
  }

  getUserDetails(): Observable<any> {
    return this.http.get(environment.baseUrl + `/api/${this.selectedData.id}`).pipe(
      map((response) => response)
    );
  }

  sendEmailTextMessge() {
    // this.isTextMessageSent = false;
    // Get user details.
    this.getUserDetails().subscribe(
      (user: any) => {
        const userDetails = user[0];
        console.log("user details >>", userDetails);
        console.log(userDetails.mobile_no)
        // Send Text Message.
        const createUrl = environment.baseUrl + '/twilio/sendTextMessage';

        this.http.post(createUrl, {
          messageBody: this.lastSentMessage,
          sourceUserName: this.currentUserName,
          targetUserName: this.selectedData.name,
          targetUserEmail: userDetails.email,
          conversionId: this.convId,
          contactNo: userDetails.mobile_no,
          CommunicationMode: this.commMode
        }).subscribe((response) => {
          console.log("sendTextMessge: ", response);
        });
      },
      error => {
        console.log(error);
      }
    );
    this.isTextMessageSent = false;
    this.isEmailMessageSent = false;
  }

  onUP() {
    if (this.selectedFile) {
      console.log("HHHHGGGGFFFF");
      const abc = "HELLO HOW ARE YOU";
      this.http.post(environment.baseUrl + '/api/poiu', { message: abc })
        .subscribe(res => {
          console.log(res);
        });
    }
  }


  onUpload1() {
    if (this.selectedFile) {
      const fd = new FormData();
      fd.append('file', this.selectedFile, this.selectedFile.name);
      const fileField = fd.get('file');
      console.log(fd);
      this.http.post(environment.baseUrl + '/api/upload', fd, { responseType: 'blob' })
        .subscribe(res => {

          const reader = new FileReader();
          // reader.readAsDataURL(res);
          reader.onloadend = () => {
            const dataUrl: any = reader.result;
            this.imageUrl = dataUrl;
            console.log(dataUrl);
            const img = document.createElement('img');
            img.src = dataUrl;
            document.body.appendChild(img);
            console.log(">", img);
          };

          console.log(res);
        },
          error => {
            console.log(error);
          });
    } else {
      console.error("No file selected.");
    }
  }

  onFileSelected2(event: any) {
    const file: File = event.target.files[0];
    this.mediaExist = true;
    const reader = new FileReader();
    reader.onloadend = () => {
      console.log("111");
      const base64data = (reader.result as string).split(',')[1];
      this.uploadFile(base64data, file.name);
    };
    reader.readAsDataURL(file);
  }

  uploadFile(base64Data: string, fileName: string) {
    this.fileName = fileName;
    this.base64Data = base64Data;

    this.createConversationMessageMEDIA();
    console.log("333");
  }

  // CREATE CONV MEDIA ATTACHMENT
  async createConversationMessageMEDIA() {
    this.isTextMessageSent = false;
    this.isEmailMessageSent = false;

    const msgData = this.msgForm.value;
    console.log(msgData.message);
    const createUrl = environment.baseUrl + '/twilio/create';

    if (this.convId !== null && this.convId !== undefined && this.convId !== "") {
      console.log(">>>>>>>>>>>>>>");
      if (this.mediaOptions) {
        const media = JSON.stringify(this.mediaOptions.media);
      } else {
        console.log("NO MEDIA");
      }

      // console.log("BLOB>>  CREATE CONV", this.mediaOptions.media);
      console.log("I'm in the If block" + "convid", this.convId);

      console.log("MD> ", this.fileName,this.base64Data);

      const payload = {
        CommunicationType: "Message",
        sourceUser: this.currentUser,
        targetUser: this.selectedData.id,
        messageBody: msgData.message,
        sourceUserName: this.currentUserName,
        targetUserName: this.selectedData.name,
        conversionId: this.convId,
        // Media: this.mediaOptions
        Media: this.mediaExist ? {
          fileName : this.fileName,
          base64Data : this.base64Data
        } : null
      };

      console.log("PAYLOAD>>", payload);
      // console.log("BLOB>>  CREATE CONV END", this.mediaOptions);
      // this.http.post(createUrl, payload).subscribe((response) => {
      // });
      const response = await this.http.post(createUrl, payload, {withCredentials: true}).toPromise();
      console.log("Response", response);
    } else {
      console.log("I'm in the else block" + "convid", this.convId);
      this.http.post(createUrl, {
        CommunicationType: "Message",
        sourceUser: this.currentUser,
        targetUser: this.selectedData.id,
        messageBody: msgData.message,
        sourceUserName: this.currentUserName,
        targetUserName: this.selectedData.name,
        conversionId: "",
        // Media: this.mediaOptions
        Media: this.mediaExist ? {
          fileName : this.fileName,
          base64Data : this.base64Data
        } : null
      }).subscribe((response) => {
        console.log(response);
      });
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // TO CREATE A NEW CONVERSATION 
  // OR
  // CONTINUE WITH THE EXIXTING CONVERSATION.
  async createConversationMessage() {
    this.isTextMessageSent = false;
    this.isEmailMessageSent = false;

    const msgData = this.msgForm.value;
    console.log(msgData.message);
    const createUrl = environment.baseUrl + '/twilio/create';

    if (this.convId !== null && this.convId !== undefined && this.convId !== "") {
      console.log(">>>>>>>>>>>>>>");
      if (this.mediaOptions) {
        const media = JSON.stringify(this.mediaOptions.media);
      } else {
        console.log("NO MEDIA");
      }

      // console.log("BLOB>>  CREATE CONV", this.mediaOptions.media);
      console.log("I'm in the If block" + "convid", this.convId);

      console.log("MD> ", this.fileName,this.base64Data);

      const payload = {
        CommunicationType: "Message",
        sourceUser: this.currentUser,
        targetUser: this.selectedData.id,
        messageBody: msgData.message,
        sourceUserName: this.currentUserName,
        targetUserName: this.selectedData.name,
        conversionId: this.convId,
        // Media: this.mediaOptions
        Media: this.mediaExist ? {
          fileName : this.fileName,
          base64Data : this.base64Data
        } : null
      };

      console.log("PAYLOAD>>", payload);
      // console.log("BLOB>>  CREATE CONV END", this.mediaOptions);
      // this.http.post(createUrl, payload).subscribe((response) => {
      // });
      const response = await this.http.post(createUrl, payload, {withCredentials: true}).toPromise();
      console.log("Response", response);
    } else {
      console.log("I'm in the else block" + "convid", this.convId);
      this.http.post(createUrl, {
        CommunicationType: "Message",
        sourceUser: this.currentUser,
        targetUser: this.selectedData.id,
        messageBody: msgData.message,
        sourceUserName: this.currentUserName,
        targetUserName: this.selectedData.name,
        conversionId: "",
        // Media: this.mediaOptions
        Media: this.mediaExist ? {
          fileName : this.fileName,
          base64Data : this.base64Data
        } : null
      }).subscribe((response) => {
        console.log(response);
      });
    }
  }


  scrollToBottom(): void {
    try {
      this.chatWindow.nativeElement.scrollTop = this.chatWindow.nativeElement.scrollHeight;
    } catch (err) { }
  }

  openChatWindow(user: { id: number; name: string }) {

    this.checkUserOnlineStatus(user.name);

    this.isCRHC = user.name === "CRHC";

    try {
      if (user.name === "CRHC") {
        console.log("CURRENT LOGGED IN USER CRHC >>", this.currentUserName);
        this.CRHCID = "1234";
      }
    }
    catch (error) {
      console.log("openChatWindow error :", error);
    }

    // this.checkUserOnlineStatus(user.name);

    this.selectedId = user.id;
    let sourceuserid = this.currentUser;
    this.selectedUserName = user.name;
    this.selectedData = user;
    this.scrollToBottom();
    this.getAllList(sourceuserid, this.selectedId);
    this.messages = [];

    console.log("END OF THE openChatWindow():");
  }

  /////////////////////////  DIALOGFLOW CODE STARTS HERE  //////////////////////////////////////

  callDialogflowFun() {
    this.updateContactNo()
    //this.sendMessageDialog()
  }

  updateContactNo() {

    console.log("IN UPFDATE CONTACT NO");

    //createing object userMessage
    const userMessage = {
      from: 'user',                 // indicating that this message is from the user
      content: this.Body            // User inputted message in the text field
    };
    this.messages.push(userMessage);

    this.http.post(environment.baseUrl + '/automated-messages/update-contact', { From: 'dialogflow', Body: this.Body }).subscribe((response: any) => {

      if (response.message && response.message.reply && response.message.reply.length > 0) {
        const replies = response.message.reply;
        const extractedMessages = replies.map(reply => {
          const cleanedReplay = reply.replace(/\\n/g, '\n').replace(/"/g, '');;
          return {
            from: 'api',
            content: cleanedReplay
          };
        },
        );
        // Adding the extracted messages to the messages array
        this.messages.push(...extractedMessages);
        console.log("extractedMessages", extractedMessages)
      } else {
        const connectionProblemMessage = {
          from: 'api',
          content: "Connection problem"
        };
        console.log("connectionProblemMessage", connectionProblemMessage);
        this.messages.push(connectionProblemMessage);
      }
      this.Body = '';
    });
  }

  sendMessageDialog() {
    //createing object userMessage
    const userMessage = {
      from: 'user',                 // indicating that this message is from the user
      content: this.Body            // User inputted message in the text field
    };
    this.messages.push(userMessage);

    this.http.post(environment.baseUrl + '/automated-messages/auto-msg', { From: this.currentUser, Body: this.Body }).subscribe((response: any) => {

      if (response.message && response.message.reply && response.message.reply.length > 0) {
        const replies = response.message.reply;
        const extractedMessages = replies.map(reply => {
          const cleanedReplay = reply.replace(/\\n/g, '\n').replace(/"/g, '');;
          return {
            from: 'api',
            content: cleanedReplay
          };
        },
        );
        // Adding the extracted messages to the messages array
        this.messages.push(...extractedMessages);
        console.log("extractedMessages", extractedMessages)
      } else {
        const connectionProblemMessage = {
          from: 'api',
          content: "Connection problem"
        };
        console.log("connectionProblemMessage", connectionProblemMessage);
        this.messages.push(connectionProblemMessage);
      }
      this.Body = '';
    });
  }

  // GETTING THE LIST MESSAGES BASED ON THE CONVERSATION ID
  // SEPAERATE USER AND API MESSAGES
  async refreshChat(resdata) {
    console.log("BEGINNING OF THE refreshChat() :");
    const params = { conversionId: resdata };


    await this.http.get(environment.baseUrl + '/twilio/conversions', { params }).subscribe(res => {
      this.messageData = res;
      console.log("Message Data", this.messageData);

      const lastIndex = this.messageData.length - 1;
      // console.log("Last Array Index:>>>>>>>>>>>>>>", lastIndex);


      console.log("this.sourceParticipanSid", this.sourceParticipanSid); // getting data
      console.log("this.messageData.participant_sid", this.messageData.participant_sid);   // undefined
 

      this.messages = [];
      this.messageData.forEach(message => {
        console.log("START OF FOREACH LOOP");
        console.log(this.messageData);

        if (message.participant_sid === this.sourceParticipanSid) {
          console.log("Matched with source Participant sid", this.sourceParticipanSid);
          // console.log("Message index: ", message.index);
          //createing object for sendersMessage
          const userMessage = {
            from: 'user',                   // indicating that this message is from the user
            content: message.body           // Sender inputted message in the text field
          };
          this.messages.push(userMessage);
          console.log("END of IF block of USER MESSAGE", userMessage, this.messageData);
        } else if (message.participant_sid === this.tergetParticipanSid) {
          console.log("Matched with target Participant sid", this.tergetParticipanSid);
          // console.log("Message index: ", message.index);
          //createing object for apiMessage
          const apiMessage = {
            from: 'api',
            content: message.body
          };
          this.messages.push(apiMessage);
        } else {
          if (message.participant_sid === this.tergetParticipanSid) {
            const apiMessage = {
              from: 'api',
              content: message.body,
              mediaUrl: message.mediaUrl // Add mediaUrl to apiMessage object
            };
            this.messages.push(apiMessage);
          }
          // this.messages.push(apiMessage);
        }

        console.log("END OF FOREACH LOOP");
      });

      console.log("END OF THE refreshChat() :");
      console.log(this.convId);
    },
      (err) => {
        console.error('Error fetching message data', err);
      }
    );
  }
  /////////////////////////  DIALOGFLOW CODE ENDS HERE  //////////////////////////////////////


  // GETTING DATA 
  // ('conversationId', 'sourceParticipanSid', 'tergetParticipanSid', 'sourceUser', 'targetUser')
  getAllList(sourceUser: string, targetUser: string) {
    console.log("BEGINNING OF THE getAllList():");
    let sourceuserid = sourceUser;
    let targetuserid = targetUser;
    let chUrl = environment.baseUrl + `/twilio/getConvId/${sourceUser}/${targetUser}`;

    console.log('link: ', targetuserid, ' ', sourceuserid, ' ', chUrl);

    this.http.get<any>(chUrl).subscribe((res) => {
      console.log("abcdefg", sourceuserid);
      console.log("abcdefg", res.sourceUser);
      console.log("RESULT.....", res);
      this.convId = res.conversationId;

      let srcuserid = JSON.parse(sourceuserid);
      let srcuser = JSON.parse(res.sourceUser);

      if (srcuserid === srcuser) {
        this.sourceParticipanSid = res.sourceParticipanSid;
        this.tergetParticipanSid = res.tergetParticipanSid;
      } else {
        this.sourceParticipanSid = res.tergetParticipanSid;
        this.tergetParticipanSid = res.sourceParticipanSid;
      }
      // CALLING REFRESHCHAT() WITH PARAMETER CONVID
      this.refreshChat(this.convId);
      console.log(this.convId)
      console.log("END OF THE getAllList():");
    }, (error) => {
      console.log("Please create a new conversation, ThankYou");
      console.log(error);
    });
  }
}
