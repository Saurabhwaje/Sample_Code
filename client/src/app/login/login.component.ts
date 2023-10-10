import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
// import { SocketService } from '../socket.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  form: FormGroup | any;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    // private socketService: SocketService
  ) {
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      email: '',
      password: ''
    });
  }

  submit(): void {
    this.http.post(environment.baseUrl + '/api/login', this.form.getRawValue(), {
      withCredentials: true
    }).subscribe((response: any) => {
      console.log('Logged in user:', response.user); // Console log the name of the logged-in user

      // this.socketService.connect(response.user);
      
      // Store the JWT cookie in local storage
      //localStorage.setItem('currentUser', JSON.stringify(response.user));
  
      // Navigate to the send message page
      this.router.navigate(['/twiliochat']);
    });
  }  
}
