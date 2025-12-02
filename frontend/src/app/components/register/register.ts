import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  name: string = '';
  nickname: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.name || !this.nickname || !this.email || !this.password) {
      this.errorMessage = 'Todos los campos son obligatorios';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    const nicknameRegex = /^[a-zA-Z0-9_]+$/;
    if (!nicknameRegex.test(this.nickname)) {
      this.errorMessage = 'El nickname solo puede contener letras, números y guiones bajos';
      return;
    }

    if (this.nickname.length < 3) {
      this.errorMessage = 'El nickname debe tener al menos 3 caracteres';
      return;
    }

    const user = {
      name: this.name,
      nickname: this.nickname,
      email: this.email,
      password: this.password
    };

    this.authService.register(user).subscribe({
      next: (response) => {
        console.log('Usuario registrado:', response);
        this.successMessage = 'Usuario registrado exitosamente. Redirigiendo al login...';
        this.errorMessage = '';
        
        this.name = '';
        this.nickname = '';
        this.email = '';
        this.password = '';
        this.confirmPassword = '';

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error al registrar usuario:', error);
        this.errorMessage = error.error?.error || error.error?.message || 'Error al registrar el usuario';
        this.successMessage = '';
      }
    });
  }
}