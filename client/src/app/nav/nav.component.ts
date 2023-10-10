import { Component, OnInit } from '@angular/core';
import { Emitters } from '../emitters/emitters';
import { HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';
import { SocketService } from '../socket.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  authenticated = false;
  userName: any;

  constructor(private http: HttpClient,private socketService: SocketService) {
  }

  ngOnInit() {
    
    Emitters.authEmitter.subscribe(
      (auth: boolean) => {
        this.authenticated = auth;
        if (auth) {
          this.http.get(environment.baseUrl + '/api/user', { withCredentials: true }).subscribe(
            (res: any) => {
              this.userName = res.name;
              // this.socketService.connect(res.name);
            },
            error => {
              console.log(error);
            }
          );
        }
      }
    );
  }

  logout(): void {

    console.log("Logout ...........");
    
    // Clear local storage
    localStorage.clear();
  
    // Clear session storage
    sessionStorage.clear();

    
  
    // Perform other logout operations
    this.http.post(environment.baseUrl + '/api/logout', {}, { withCredentials: true })
      .subscribe(() => {
        this.authenticated = false;
        this.userName = null;
      });
  
    this.socketService.disconnect();
  }
  
}



// OLD 

// import { Component, OnInit } from '@angular/core';
// import { Emitters } from '../emitters/emitters';
// import { HttpClient} from '@angular/common/http';
// import { Observable } from 'rxjs';

// @Component({
//   selector: 'app-nav',
//   templateUrl: './nav.component.html',
//   styleUrls: ['./nav.component.css']
// })
// export class NavComponent implements OnInit {
//   authenticated = false;
//   userName: any;

//   constructor(private http: HttpClient) {
//   }

//   ngOnInit() {
    
//     Emitters.authEmitter.subscribe(
//       (auth: boolean) => {
//         this.authenticated = auth;
//         if (auth) {
//           // console.log("At the right place");
//           this.http.get('http://localhost:3000/api/user', { withCredentials: true }).subscribe(
//             (res: any) => {
//               this.userName = res.name;
//             },
//             error => {
//               console.log(error);
//             }
//           );
//         }
//       }
//     );
//   }

//   logout(): void {
//     this.http.post('http://localhost:3000/api/logout', {}, {withCredentials: true})
//       .subscribe(() => {
//         this.authenticated = false,
//         this.userName = null
//       }
//         );
//   }
// }
