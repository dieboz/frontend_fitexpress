import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-user-search',
  standalone: false,
  templateUrl: './user-search.html',
  styleUrls: ['./user-search.css']
})
export class UserSearchComponent {
  searchQuery: string = '';
  searchResults: any[] = [];
  searching: boolean = false;
  noResults: boolean = false;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  searchUsers(): void {
    this.noResults = false;

    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      return;
    }

    this.searching = true;
    this.userService.searchUsers(this.searchQuery.trim()).subscribe({
      next: (users) => {
        console.log('Usuarios encontrados:', users);
        this.searchResults = users;
        this.searching = false;
        this.noResults = users.length === 0;
      },
      error: (error) => {
        console.error('Error al buscar usuarios:', error);
        this.searching = false;
        this.searchResults = [];
        this.noResults = true;
      }
    });
  }

  getUserInitial(user: any): string {
    return user.name?.charAt(0).toUpperCase() || 'U';
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchResults = [];
    this.noResults = false;
  }
}