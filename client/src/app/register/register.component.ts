import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient} from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  form: FormGroup | any;

  constructor(          
    private formBuilder: FormBuilder,  // To create a instance of the FormGroup, FormControl, FormArray
    private http: HttpClient,
    private router: Router,
  ) {
  }

  // invoked immediately after the default change detector
  ngOnInit(): void {
    this.form = this.formBuilder.group({
      name: '',
      email: '',
      password: '',
      // contactNo: '',
      // alternateContactNo: ''
    });
  }

  submit(): void {                                   // To get all the values on to the console
    this.http.post(environment.baseUrl + '/api/register', this.form.getRawValue()) 
      .subscribe(() => this.router.navigate(['/login']));
  }
}
