import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App {
  showNavbar: boolean = false;

  constructor(private router: Router) {
    // Escuchar cambios de ruta para decidir si mostrar el navbar
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Ocultar navbar en login, register y landing
      const hiddenRoutes = ['/', '/login', '/register'];
      this.showNavbar = !hiddenRoutes.includes(event.url);
    });
  }
}