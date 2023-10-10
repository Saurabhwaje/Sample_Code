// WORKING LOCAL
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Socket } from 'ngx-socket-io';
import { io } from 'socket.io-client';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;

  constructor(public socketIO: Socket) {
    this.socket = this.socketIO;    
  }

  connect(name: string): void {
    console.log("IM IN THE CONNECT()");
    
    const handleConnect = () => {
      console.log("Socket ID:", this.socket.ioSocket.id);
      console.log("name : " + name + " >>>>>  " + this.socket.ioSocket.id);
      this.sendSocketIdToServer(name, this.socket.ioSocket.id);
      this.socket.emit('userOnline');
    };
  
    // Check if the socket is already connected
    if (this.socket.ioSocket.connected) {
      handleConnect();
    } else {
      // Wait for the "connect" event before attempting to connect the socket
      this.socket.on("connect", handleConnect);
    }
  
    // Connect the socket if not already connected
    if (!this.socket.ioSocket.connected) {
      this.socket.connect();
    }
  
    this.socket.on("disconnect", (reason) => {
      console.log("disconnect");
      if (reason === "io server disconnect") {
        console.log(this.socket.ioSocket.connected);
      }
    });
  
    console.log("END OF CONNECT()");
  }

  async sendSocketIdToServer(name: string, socketId: string) {
    fetch(environment.baseUrl + '/twilio/save-socketid', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, socketId }),
    })
      .then(response => {
        if (response.ok) {
          console.log('Socket ID saved successfully.');
        } else {
          console.log('Failed to save socket ID.');
        }
      })
      .catch(error => {
        console.log('Error occurred while saving socket ID:', error);
      });
  }

  receiveMessages(): Observable<any> {
    console.log("Message received");
    return this.socket.fromEvent('receiveMessage');
  }
  disconnect(): void {
    console.log("IM IN THE DISCONNECT()");
  
    // Emit a 'userOffline' event to the server
    this.socket.emit('userOffline');
  
    // Remove all event listeners associated with the socket
    this.socket.removeAllListeners();
  
    // Disconnect the socket
    this.socket.disconnect();
  
    console.log("END OF DISCONNECT()");
  }
  // disconnect(): void {
  //   console.log("Offline...");
  //   this.socket.disconnect();
  // }

  // CONVERSATIONS
  sendMessage(message: string, from: string, to: string): void {
    console.log("IN SEND MESSAGE OF SOCKET SERVICE");
    this.socket.emit('sendMessage', { content: message, from: from, to: to});
  }

  // DIALOGFLOW
  sendMessage1(message: string, from: string, to: string): void {
    this.socket.emit('sendMessage1', { content: message, from: from, to: to });
  }
} 

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// WORKING SERVER

// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
// import { Socket } from 'ngx-socket-io';
// // import { io } from 'socket.io-client';
// import { environment } from '../environments/environment';

// @Injectable({
//   providedIn: 'root',
// })
// export class SocketService {
//   private socket: Socket;

//   constructor(public socketIO: Socket) {
//     this.socket = this.socketIO;

    
//   }

//   // connect(name: string): void {
//   //   console.log("IM IN THE CONNECT()");
//     // const options = {
//     //   query: { name: name },
//     //   withCredentials: true,
//     // };
//     // this.socket = io('http://localhost:3000');
  
//       // const handleConnect = () => {
//       //   console.log("Socket ID:", this.socket.ioSocket.id);
//       //   console.log("name : " + name + " >>>>>  " + this.socket.ioSocket.id);
//       //   this.sendSocketIdToServer(name, this.socket.ioSocket.id);
//       //   this.socket.emit('userOnline');
//       // }
    
//       // if (this.socket.ioSocket.connected) {
//       //   console.log("11 :",this.socket.ioSocket.connected);
//       //   // If the socket is already connected, execute the callback immediately
//       //   handleConnect();
//       // } else {
//       //   console.log("2222");
//       //   // If the socket is not yet connected, wait for the "connect" event
//       //   this.socket.on("connect", handleConnect);
//       // }

//       connect(name: string): void {
//         console.log("IM IN THE CONNECT()");
//         const handleConnect = () => {
//           console.log("Socket ID:", this.socket.ioSocket.id);
//           console.log("name : " + name + " >>>>>  " + this.socket.ioSocket.id);
//           this.sendSocketIdToServer(name, this.socket.ioSocket.id);
//           this.socket.emit('userOnline');
//         }
//         // Check if the socket is already connected
//         if (this.socket.ioSocket.connected) {
//           console.log(">>>>>>");
//           handleConnect();
//         } else {
//           console.log("<<<<<<<");
//           // Wait for the "connect" event before attempting to connect the socket
//           this.socket.on("connect", handleConnect);
      
//           // Connect the socket
//           // this.socket.connect();
//         }
//         // Remove the event listener for "disconnect"
//         const disconnectHandler = () => {
//           console.log("disconnect");
//           // this.socket.removeListener("disconnect", disconnectHandler);
//         }
//         // debugger
//         this.socket.on("disconnect", disconnectHandler);
      
//         console.log("END OF CONNECT()");
//       }
      

//       // connect(name: string): void {
//       //   console.log("IM IN THE CONNECT()");
//       //   const handleConnect = () => {
//       //     console.log("Socket ID:", this.socket.ioSocket.id);
//       //     console.log("name : " + name + " >>>>>  " + this.socket.ioSocket.id);
//       //     this.sendSocketIdToServer(name, this.socket.ioSocket.id);
//       //     this.socket.emit('userOnline');
      
//       //     // Remove the event listener for "connect" after the first execution
//       //     this.socket.removeListener("connect", handleConnect);
//       //   }
      
//       //   // Wait for the "connect" event before attempting to connect the socket
//       //   this.socket.on("connect", handleConnect);
      
//       //   // Connect the socket
//       //   this.socket.connect();
      
//       //   this.socket.on("disconnect", (reason) => {
//       //     console.log("disconnect");
//       //     if (reason === "io server disconnect") {
//       //       console.log(this.socket.ioSocket.connected);
//       //     }
//       //     console.log(this.socket.ioSocket.connected);
//       //   });
      
//       //   console.log("END OF CONNECT()");
//       // }
      
      

//   async sendSocketIdToServer(name: string, socketId: string) {
//     try {
//       const response = await fetch(environment.baseUrl + '/twilio/save-socketid', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ name, socketId }),
//       });
  
//       if (response.ok) {
//         console.log('Socket ID saved successfully.');
//       } else {
//         console.log('Failed to save socket ID.');
//       }
//     } catch (error) {
//       console.log('Error occurred while saving socket ID:', error);
//     }
//   }

//   // async sendSocketIdToServer(name: string, socketId: string) {
//   //   fetch(environment.baseUrl + '/twilio/save-socketid', {
//   //     method: 'POST',
//   //     headers: {
//   //       'Content-Type': 'application/json',
//   //     },
//   //     body: JSON.stringify({ name, socketId }),
//   //   })
//   //     .then(response => {
//   //       if (response.ok) {
//   //         console.log('Socket ID saved successfully.');
//   //       } else {
//   //         console.log('Failed to save socket ID.');
//   //       }
//   //     })
//   //     .catch(error => {
//   //       console.log('Error occurred while saving socket ID:', error);
//   //     });
//   // }

//   receiveMessages(): Observable<any> {
//     console.log("Message received");
//     return this.socket.fromEvent('receiveMessage');
//   }

//   disconnect(): void {
//     // debugger
//     this.socket.disconnect();
//   }

//   // CONVERSATIONS
//   sendMessage(message: string, from: string, to: string): void {
//     this.socket.emit('sendMessage', { content: message, from: from, to: to });
//   }

//   // DIALOGFLOW
//   sendMessage1(message: string, from: string, to: string): void {
//     this.socket.emit('sendMessage1', { content: message, from: from, to: to });
//   }
// }







// import { Injectable } from '@angular/core';
// import { async, Observable } from 'rxjs';
// import { io } from 'socket.io-client';
// import { Socket } from 'ngx-socket-io';

// @Injectable({
//   providedIn: 'root',
// })
// export class SocketService {
//   private socket: Socket;

//   constructor() {}

//   connect(name: string): void {
//     console.log("IM IN THE CONNECT()");
//     const options = {
//       query: { name: name },
//       withCredentials: true,
//     };

//     //this.socket = io('http://localhost:3000', options);

//     try{
//     this.socket.on("connect", async () => {
//       console.log("Socket ID:", this.socket.id);
//       this.sendSocketIdToServer(name, this.socket.id);
//     });
//     }catch(error){
//     console.log("Connect() Error :", error)
//     }

//     this.socket.on("disconnect", (reason) => {
//       if (reason === "io server disconnect") {
//         console.log(this.socket.active);
//       }
//       console.log(this.socket.active);
//     });
//     console.log("END OF CONNECT()");
//   }

//   sendSocketIdToServer(name: string, socketId: string): void {
//     fetch('http://localhost:3000/twilio/save-socketid', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ name, socketId }),
//     })
//       .then(response => {
//         if (response.ok) {
//           console.log('Socket ID saved successfully.');
//         } else {
//           console.log('Failed to save socket ID.');
//         }
//       })
//       .catch(error => {
//         console.log('Error occurred while saving socket ID:', error);
//       });
//   }

//   receiveMessages(): Observable < any > {
//   return new Observable<any>(observer => {
//     this.socket.on('receiveMessage', (data: any) => {
//       observer.next(data);
//     });
//   });
// }

//   disconnect(): void {
//     this.socket.disconnect();
//   }

//   sendMessage(message: string, from: string, to: string): void {
//     this.socket.emit('sendMessage', { content: message, from: from, to: to });
//   }
// }



//TODO
// import { Injectable } from '@angular/core';
// import { io, Socket } from 'socket.io-client';
// import { Observable, catchError, fromEvent } from 'rxjs';
// import { ManagerOptions, SocketOptions } from 'socket.io-client';
// //import { io } from 'socket.io-client';
// import { v4 as uuidv4 } from 'uuid';

// @Injectable({
//   providedIn: 'root',
// })
// export class SocketService {

//   private socket!: Socket;

//   constructor() { }



//*******************************************************************
  // connect(name: string): void {
  //   const options = {
  //     query: { name },
  //     withCredentials: true,
  //     transportOptions: {
  //       polling: {
  //         extraHeaders: {
  //           'my-custom-header': 'your-custom-value',
  //           'Authorization': 'your-authorization-token',
  //         },
  //       },
  //     },
  //   };

  //   this.socket = io('http://localhost:3000', options);

  //   fromEvent(this.socket, 'connect').subscribe(() => {
  //     const socketId = this.socket.id;
  //     this.socket.emit('connected', { name, socketId });
  //   });
  // }

  // connect(name: string): void {
  //   console.log("I'm IN THE CONNECT()...");
  //   const options: Partial<ManagerOptions & SocketOptions> = {
  //     withCredentials: true,
  //   };
  //   console.log("NAME :", name);

  //   // Create a new WebSocket connection to the server
  //   this.socket = io('http://localhost:3000', options);

  //   this.socket.on('connect', () => {
  //     // Generate a unique socketId for the client's socket
  //     const socketId = this.socket.id;
  //     console.log("SOCKETID>>", socketId + " " + name);
  //     // Send the socketId to the server to be saved in the database
  //     // this.socket.emit('saveSocketId', { name: name, socketId: socketId });
  //   });
  //   console.log("END OF THE CONNECT()...");
  // }
  //*******************************************************************


  //TODO
  // connect(name: string): void {
  //   console.log("I'm IN THE CONNECT()...");

  //   const options: Partial<ManagerOptions & SocketOptions> = {
  //     query: { name: name },
  //     withCredentials: true,
  //   };

  //   console.log("NAME :", name);

  //   // Generate a unique socketId for the client's socket
  //   const socketId = uuidv4();
  //   console.log("SOCKETID>>", socketId + " " + name);
  //   this.socket = io('http://localhost:3000',options);

  //   // this.socket = io('http://localhost:3000', {
  //   //   withCredentials: true
  //   // }); // Initialize the socket object

  //   console.log("--------------------");
  //   try{
  //   //  const socket = io();



  //TODO
  // console.log("Undefined socketid:::::::::::::::",this.socket.id); // undefined

  //        this.socket.on("connect", () => {
  //         console.log("Socket IDDDD:::::::", this.socket.id); // "G5p5..."
  //       });
  //       this.socket.on("disconnect", (reason) => {
  //         if (reason === "io server disconnect") {
  //           // the disconnection was initiated by the server, you need to manually reconnect
  //           console.log(this.socket.active); // false
  //         }
  //         // else the socket will automatically try to reconnect
  //         console.log(this.socket.active); // true
  //       });
  //     }
  //     catch(error)
  //     {
  //       console.log("--------------------Error::::",error);
  //     }

  //      console.log("--------------------Socket Response::::",this.socket.connected);
  //      this.sendSocketIdToServer(name, socketId);
  //      console.log("--------------------SocketId::::",this.socket.id);




//*******************************************************************
  // console.log(JSON.parse(JSON.stringify(this.socket.connect)));
  //"______________________");
  // this.sendSocketIdToServer(name, socketId);

  // this.socket.on('connect', () => {
  // Generate a unique socketId for the client's socket
  //    const socketId = this.socket.id;
  //   console.log("SOCKETID>>", socketId + " " + name);

  // Send the socketId to the server to be saved in the database
  // this.socket.emit('saveSocketId', { name: name, socketId: socketId });
  //});

  // Send the socketId to the server to be saved in the database
  //this.socket.emit('saveSocketId', { name: name, socketId: socketId });
  //*******************************************************************


  //TODO
  // console.log("END OF THE CONNECT()...");  
//}

//*******************************************************************
// connect(name: string): void {
//   console.log("I'm IN THE CONNECT()...");
//   const options: Partial<ManagerOptions & SocketOptions> = {
//     withCredentials: true,
//   };
//   console.log("NAME:", name);

//   this.socket = io('http://localhost:3000', options);

//   this.socket.on('connect', () => {
//     // Generate a unique socketId for the client's socket
//     const socketId = this.socket.id;
//     console.log("SOCKETID:", socketId + " " + name);

//     // Send the socketId to the server to be saved in the database
//     this.sendSocketIdToServer(name, socketId);
//   });  
//   console.log("END OF THE CONNECT()...");
// }
//*******************************************************************


//TODO
// sendSocketIdToServer(name: string, socketId: string): void {
//   // Make an HTTP request to your server to save the socketId in the database
//   // Replace 'http://your-server.com/saveSocketId' with the appropriate URL
//   fetch('http://localhost:3000/twilio/save-socketid', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ name, socketId }),
// })
//       .then(response => {
//   if (response.ok) {
//     console.log('Socket ID saved successfully.');
//   } else {
//     console.log('Failed to save socket ID.');
//   }
// })
//   .catch(error => {
//     console.log('Error occurred while saving socket ID:', error);
//   });
//   }


//*******************************************************************
// connect(name: string): void {
//     console.log("I'm in the connect() name:", name);
//     const query = { name: name };
//     const options: Partial<ManagerOptions & SocketOptions> = {
//       path: '/socket.io', // Add this line to specify the correct path
//       query: { name: name },
//       withCredentials: true
//     };
//     // const options: Partial<ManagerOptions & SocketOptions> = {
//     //     query: { name: name },
//     //     withCredentials: true
//     // };

//     console.log(options);
//     // { query: {… }, withCredentials: true }
//     // hostname: "localhost"
//     // path: "/socket.io"
//     // port :"3000"
//     // query:{ name: 'abc' }
//     // secure :false
//     // withCredentials:true

//     // Create a new WebSocket connection to the server
//     this.socket = io('http://localhost:3000/socket.io', options);
//     console.log("Socket Obj:",options);

//     // Listen for the 'connect' event on the socket object
//     this.socket.on('connect', () => {
//         // Generate a unique socketId for the client's socket
//         const socketId = this.socket.id;
//         console.log("SocConnect Method :::::::",socketId);
//         // Emit a 'saveSocketId' event on the socket object to save the socketId in the database
//         this.socket.emit('saveSocketId', { name: name, socketId: socketId });

//         console.log("END OF connect()", " name :" + name + " " + "socketId :" + socketId);
//     });
// }
//*******************************************************************


//TODO
// Create a new WebSocket connection to the server
// disconnect(): void {
//   this.socket.disconnect();
// }

// sendMessage(message: string, from: string, to: string): void {
//   console.log("I'm in the sendMessage()");
//   this.socket.emit('sendMessage', { content: message, from: from, to: to });
//   console.log({ content: message, from: from, to: to });
//   console.log("END OF the sendMessage()");
// }


//*******************************************************************
// receiveMessages(): Observable<{ content: string, from: string }> {
//     return new Observable<{ content: string, from: string }>((observer) => {
//         console.log("receiveMessages()A", observer);
//         this.socket.on('receiveMessage', (data: { content: string, from: string }) => {
//             observer.next({ content: data.content, from: data.from });
//             console.log("receiveMessages()B", data);
//             // console.log("receiveMessages()A",content);
//         });
//     });
// }

// receiveMessages(): Observable<{ content: string, from: string }> {
//     return new Observable<{ content: string, from: string }>((observer) => {
//         console.log("I'm in the receiveMessage()");
//         this.socket.on('receiveMessage', (data: { content: string, from: string }) => {
//             console.log("RECEIVER DATS IN THE receiveMessages()", data);
//             observer.next({ content: data.content, from: data.from });
//         });
//     });        
// }
//*******************************************************************

//TODO
// receiveMessages(): Observable < any > {
//   return new Observable<any>(observer => {
//     this.socket.on('receiveMessage', (data: any) => {
//       observer.next(data);
//     });
//   });
// }
// }

//*******************************************************************
// import { Injectable } from '@angular/core';
// import { io } from 'socket.io-client';

// @Injectable({
//   providedIn: 'root',
// })
// export class SocketService {
//   private socket: any;

//   constructor() {}

//   connect() {
//     this.socket = io('http://localhost:3000', { withCredentials: true })
//   }

//   disconnect() {
//     this.socket.disconnect();
//   }

//   on(event: string, callback: Function) {
//     this.socket.on(event, callback);
//   }

//   emit(event: string, data: any) {
//     this.socket.emit(event, data);
//   }
// }
//*******************************************************************