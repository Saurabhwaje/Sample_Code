import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatComponent } from './chat/chat.component';
import { ChatwindowstaticComponent } from './chatwindowstatic/chatwindowstatic.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { SendmessageComponent } from './sendmessage/sendmessage.component';
import { TwilioChatComponent } from './twilio-chat/twilio-chat.component';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'sendmessage', component: SendmessageComponent},
  {path: 'chat', component: ChatComponent},
  {path: 'chat/:id', component: ChatComponent },
  {path: 'chatwindowstatic', component: ChatwindowstaticComponent },
  {path: 'chatwindowstatic/:id', component: ChatwindowstaticComponent },
  {path: 'twiliochat', component: TwilioChatComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)], //  { relativeLinkResolution: 'legacy' }
  exports: [RouterModule]
})
export class AppRoutingModule {
}

