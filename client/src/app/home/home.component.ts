import { Component, OnInit } from '@angular/core';
import { Emitters } from '../emitters/emitters';
import { HttpClient } from '@angular/common/http';
import { User } from './user.model';
import { NavigationExtras, Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  authenticated = false;

  message = '';
  name = '';
  users: User[] | any;
  currentUser: String;
  otherUsers: User[];
  // currentUser = '';

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {   // It will work with your session cookies "withCredentials() -> default value false"
    this.http.get(environment.baseUrl + '/api/user', { withCredentials: true }).subscribe(    // if the server header does not include CORS header true it
      (res: any) => {
        this.message = `Hi ${res.name}`;
        this.currentUser= res.id,
        Emitters.authEmitter.emit(true);
        // this.currentUser = res.name;
      },
      error => {
        this.message = 'You are not logged in';
        Emitters.authEmitter.emit(false);
      }
    );

    // Getting the current user
    
    // console.log("current User", this.currentUser);
    // if (currentUser && currentUser.id) {
    //   console.log("current User", currentUser)

    // Getting the list of users from the databsse
    this.http.get<User[]>(environment.baseUrl + '/api/getalluserslist/?logginusername=a').subscribe(users => {
      this.users = users  // .filter(user => user.id !== currentUser.id);
    });

    Emitters.authEmitter.subscribe(
      (auth: boolean) => {
        this.authenticated = auth;
      }
    );
  }

  openChatWindow(user: { id: number; }) {
    const navigationExtras: NavigationExtras = {
    };
    // Navigate to the chat window component with user ID as parameter
    this.router.navigate(['/chatwindowstatic', user.id], navigationExtras);
  }

}

