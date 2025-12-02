import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PostService } from '../../services/post';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-post-create',
  standalone: false,
  templateUrl: './post-create.html',
  styleUrls: ['./post-create.css']
})
export class PostCreateComponent {
  content: string = '';
  image: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  currentUser: any = null;

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser = this.authService.getCurrentUser();
    
    if (!this.currentUser) {
      this.router.navigate(['/login']);
    }
  }

  onSubmit(): void {
    // Validaciones
    if (!this.content.trim()) {
      this.errorMessage = 'El contenido del post es obligatorio';
      return;
    }

    const post = {
      user_id: this.currentUser._id,
      content: this.content.trim(),
      image: this.image.trim() || undefined
    };

    console.log('Creando post:', post);

    this.postService.createPost(post).subscribe({
      next: (response) => {
        console.log('✅ Post creado:', response);
        this.successMessage = 'Post creado exitosamente. Redirigiendo al feed...';
        this.errorMessage = '';
        
        // Limpiar formulario
        this.content = '';
        this.image = '';

        // Redirigir al feed después de 1 segundo
        setTimeout(() => {
          this.router.navigate(['/feed']);
        }, 1000);
      },
      error: (error) => {
        console.error('❌ Error al crear post:', error);
        this.errorMessage = error.error?.error || 'Error al crear el post';
        this.successMessage = '';
      }
    });
  }
}