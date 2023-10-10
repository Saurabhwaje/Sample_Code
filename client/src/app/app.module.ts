import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { NavComponent } from './nav/nav.component';
import { RegisterComponent } from './register/register.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { SendmessageComponent } from './sendmessage/sendmessage.component';
import { ChatComponent } from './chat/chat.component';
import { ChattingwindowComponent } from './chattingwindow/chattingwindow.component';
import { ChatwindowstaticComponent } from './chatwindowstatic/chatwindowstatic.component';
import { TwilioChatComponent } from './twilio-chat/twilio-chat.component';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { environment } from '../environments/environment';
import { AuthorizationInterceptor } from './authorization-interceptor.service';

const config: SocketIoConfig = { url: environment.baseUrl, options: {} };

@NgModule({
  declarations: [
    AppComponent,
    TwilioChatComponent,
    HomeComponent,
    LoginComponent,
    NavComponent,
    RegisterComponent,
    SendmessageComponent,
    ChatComponent,
    ChattingwindowComponent,
    ChatwindowstaticComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    SocketIoModule.forRoot(config)
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: AuthorizationInterceptor,
    multi: true,
  },],
  bootstrap: [AppComponent]
})
export class AppModule { }
