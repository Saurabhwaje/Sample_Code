import { HttpClient } from '@angular/common/http';
// import { Component, OnInit } from '@angular/core';
import { SocketService } from './socket.service';
import { environment } from '../environments/environment';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'JwtAuth';
  authenticated = false;
  userName: any;

  constructor(private http: HttpClient, private socketService: SocketService) {
  }
}
