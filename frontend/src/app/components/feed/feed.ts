import { Component, OnInit } from '@angular/core';
import { PostService } from '../../services/post';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-feed',
  standalone: false,
  templateUrl: './feed.html',
  styleUrls: ['./feed.css'],
})
export class FeedComponent implements OnInit {
  posts: any[] = [];
  currentUser: any = null;
  commentTexts: { [postId: string]: string } = {};

  constructor(
    private postService: PostService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    console.log('Usuario actual:', this.currentUser);
    this.loadPosts();
  }

  loadPosts(): void {
    console.log('=== CARGANDO POSTS ===');
    this.postService.getAllPosts().subscribe({
      next: (posts) => {
        console.log('✅ Posts cargados:', posts);
        this.posts = posts;
        
        // Debug: Verificar fotos de perfil
        this.posts.forEach((post, index) => {
          console.log(`Post ${index}:`, {
            autor: post.user_id?.name,
            foto: post.user_id?.profile_picture,
            completo: post.user_id
          });
        });
      },
      error: (error) => {
        console.error('❌ Error al cargar posts:', error);
      }
    });
  }

  hasLiked(post: any): boolean {
    if (!this.currentUser || !post.likes) return false;
    return post.likes.some((like: any) => {
      const likeId = like._id || like;
      return likeId === this.currentUser._id;
    });
  }

  toggleLike(post: any): void {
    if (!this.currentUser) {
      alert('Debes iniciar sesión para dar like');
      return;
    }

    const hasLiked = this.hasLiked(post);

    if (hasLiked) {
      this.postService.unlikePost(post._id, this.currentUser._id).subscribe({
        next: (response) => {
          console.log('✅ Like eliminado:', response);
          this.loadPosts();
        },
        error: (error) => {
          console.error('❌ Error al quitar like:', error);
        }
      });
    } else {
      this.postService.likePost(post._id, this.currentUser._id).subscribe({
        next: (response) => {
          console.log('✅ Like agregado:', response);
          this.loadPosts();
        },
        error: (error) => {
          console.error('❌ Error al dar like:', error);
          if (error.status === 400) {
            alert('Ya diste like a este post');
          }
        }
      });
    }
  }

  addComment(post: any): void {
    const text = this.commentTexts[post._id];
    
    if (!text || !text.trim()) {
      alert('Escribe un comentario');
      return;
    }

    if (!this.currentUser) {
      alert('Debes iniciar sesión para comentar');
      return;
    }

    this.postService.addComment(post._id, this.currentUser._id, text.trim()).subscribe({
      next: (response) => {
        console.log('✅ Comentario agregado:', response);
        this.commentTexts[post._id] = '';
        this.loadPosts();
      },
      error: (error) => {
        console.error('❌ Error al agregar comentario:', error);
        alert('Error al agregar comentario');
      }
    });
  }

  deletePost(postId: string): void {
    if (!confirm('¿Estás seguro de eliminar este post?')) {
      return;
    }

    this.postService.deletePost(postId).subscribe({
      next: (response) => {
        console.log('✅ Post eliminado:', response);
        this.posts = this.posts.filter(p => p._id !== postId);
      },
      error: (error) => {
        console.error('❌ Error al eliminar post:', error);
        alert('Error al eliminar post');
      }
    });
  }

  isMyPost(post: any): boolean {
    if (!this.currentUser) return false;
    const postUserId = post.user_id?._id || post.user_id;
    return postUserId === this.currentUser._id;
  }

  getAuthorName(post: any): string {
    return post.user_id?.name || 'Usuario Desconocido';
  }

  getAuthorProfilePicture(post: any): string | null {
    return post.user_id?.profile_picture || null;
  }

  getAuthorNickname(post: any): string | null {
    return post.user_id?.nickname || null;
  }
}