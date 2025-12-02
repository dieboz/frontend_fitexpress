import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileComponent implements OnInit {
  currentUser: any = null;
  
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  
  editingProfile: boolean = false;
  profilePicture: string = '';
  userName: string = '';
  userEmail: string = '';
  nickname: string = '';
  bio: string = '';
  
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
    } else {
      this.loadUserData();
    }
  }

  loadUserData(): void {
    this.userService.getUserById(this.currentUser._id).subscribe({
      next: (user) => {
        console.log('Usuario cargado:', user);
        this.currentUser = user;
        localStorage.setItem('user', JSON.stringify(user));
        
        this.userName = user.name;
        this.userEmail = user.email;
        this.nickname = user.nickname || '';
        this.bio = user.bio || '';
        this.profilePicture = user.profile_picture || '';
      },
      error: (error) => {
        console.error('Error al cargar usuario:', error);
      }
    });
  }

  toggleEditProfile(): void {
    this.editingProfile = !this.editingProfile;
    this.errorMessage = '';
    this.successMessage = '';
    
    if (this.editingProfile) {
      this.userName = this.currentUser.name;
      this.userEmail = this.currentUser.email;
      this.nickname = this.currentUser.nickname || '';
      this.bio = this.currentUser.bio || '';
      this.profilePicture = this.currentUser.profile_picture || '';
    }
  }

  updateProfile(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.userName.trim() || !this.userEmail.trim()) {
      this.errorMessage = 'El nombre y email son obligatorios';
      return;
    }

    const updateData: any = {
      name: this.userName.trim(),
      email: this.userEmail.trim(),
      nickname: this.nickname.trim(),
      bio: this.bio.trim(),
      profile_picture: this.profilePicture.trim()
    };

    console.log('Actualizando perfil con:', updateData);

    this.userService.updateProfile(this.currentUser._id, updateData).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        this.successMessage = 'Perfil actualizado exitosamente';
        this.editingProfile = false;
        
        if (response.usuario) {
          this.currentUser = response.usuario;
          localStorage.setItem('user', JSON.stringify(response.usuario));
          
          this.userName = response.usuario.name;
          this.userEmail = response.usuario.email;
          this.nickname = response.usuario.nickname || '';
          this.bio = response.usuario.bio || '';
          this.profilePicture = response.usuario.profile_picture || '';
        }
      },
      error: (error) => {
        console.error('Error:', error);
        this.errorMessage = error.error?.error || error.error?.detalle || 'Error al actualizar el perfil';
      }
    });
  }

  changePassword(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Todos los campos son obligatorios';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas nuevas no coinciden';
      return;
    }

    if (this.newPassword.length < 6) {
      this.errorMessage = 'La nueva contraseña debe tener al menos 6 caracteres';
      return;
    }

    this.userService.changePassword(
      this.currentUser._id,
      this.currentPassword,
      this.newPassword
    ).subscribe({
      next: (response) => {
        console.log('Contraseña actualizada:', response);
        this.successMessage = 'Contraseña actualizada exitosamente';
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
      },
      error: (error) => {
        console.error('Error al cambiar contraseña:', error);
        this.errorMessage = error.error?.error || 'Error al cambiar la contraseña';
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}