import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    // Validaciones
    if (!this.email || !this.password) {
      this.errorMessage = 'Todos los campos son obligatorios';
      return;
    }

    // Intentar iniciar sesión
    const credentials = {
      email: this.email,
      password: this.password
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        this.errorMessage = '';
        
        // Redirigir al feed después del login exitoso
        this.router.navigate(['/feed']);
      },
      error: (error) => {
        console.error('Error al iniciar sesión:', error);
        this.errorMessage = error.error?.message || 'Credenciales incorrectas. Intenta nuevamente.';
      }
    });
  }
}