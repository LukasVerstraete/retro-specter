import { AuthService } from './../../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'retro-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public loginForm: FormGroup;

  public constructor(
    public auth: AuthService,
    private formBuilder: FormBuilder,
    private router: Router
  ) { }

  public ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: '',
      password: ''
    });
  }

  public async login(): Promise<void> {
    await this.auth.Login(
      this.loginForm.value.email,
      this.loginForm.value.password
    );
    this.router.navigate(['/specter']);
  }

}
