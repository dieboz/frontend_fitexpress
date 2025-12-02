import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CompanyService } from '../../services/company';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-company-list',
  standalone: false,
  templateUrl: './company-list.html',
  styleUrl: './company-list.css',
})
export class CompanyList implements OnInit {
  companies: any[] = [];
  currentUser: any = null;
  loading: boolean = false;
  showCreateForm: boolean = false;
  
  newCompany = {
    name: '',
    description: '',
    email: '',
    logo: '',
    location: ''
  };
  
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private companyService: CompanyService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.loading = true;
    this.companyService.getAllCompanies().subscribe({
      next: (companies: any) => {
        console.log('✅ Empresas cargadas:', companies);
        this.companies = companies;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('❌ Error al cargar empresas:', error);
        this.loading = false;
      }
    });
  }

  viewCompany(companyId: string): void {
    this.router.navigate(['/company', companyId]);
  }

  isMyCompany(company: any): boolean {
    if (!this.currentUser) return false;
    const ownerId = company.owner_id?._id || company.owner_id;
    return ownerId === this.currentUser._id;
  }

  isFollowing(company: any): boolean {
    if (!this.currentUser) return false;
    return company.followers?.some((f: any) => {
      const followerId = f._id || f;
      return followerId === this.currentUser._id;
    });
  }

  toggleFollow(company: any, event: Event): void {
    event.stopPropagation();
    
    if (!this.currentUser) {
      alert('Debes iniciar sesión para seguir empresas');
      return;
    }

    const isFollowing = this.isFollowing(company);

    if (isFollowing) {
      this.companyService.unfollowCompany(company._id, this.currentUser._id).subscribe({
        next: () => {
          console.log('✅ Dejaste de seguir la empresa');
          this.loadCompanies();
        },
        error: (error: any) => {
          console.error('❌ Error al dejar de seguir:', error);
        }
      });
    } else {
      this.companyService.followCompany(company._id, this.currentUser._id).subscribe({
        next: () => {
          console.log('✅ Ahora sigues la empresa');
          this.loadCompanies();
        },
        error: (error: any) => {
          console.error('❌ Error al seguir:', error);
        }
      });
    }
  }

  getFollowersCount(company: any): number {
    return company.followers?.length || 0;
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    this.errorMessage = '';
    this.successMessage = '';
    
    if (!this.showCreateForm) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.newCompany = {
      name: '',
      description: '',
      email: '',
      logo: '',
      location: ''
    };
  }

  createCompany(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.newCompany.name || !this.newCompany.email) {
      this.errorMessage = 'El nombre y email son obligatorios';
      return;
    }

    if (!this.currentUser) {
      this.errorMessage = 'Debes iniciar sesión';
      return;
    }

    const companyData = {
      ...this.newCompany,
      owner_id: this.currentUser._id
    };

    this.companyService.createCompany(companyData).subscribe({
      next: (response: any) => {
        console.log('✅ Empresa creada:', response);
        this.successMessage = 'Empresa creada exitosamente';
        this.resetForm();
        this.showCreateForm = false;
        this.loadCompanies();
      },
      error: (error: any) => {
        console.error('❌ Error al crear empresa:', error);
        this.errorMessage = error.error?.error || 'Error al crear la empresa';
      }
    });
  }

  deleteCompany(companyId: string, event: Event): void {
    event.stopPropagation();
    
    if (!confirm('¿Estás seguro de eliminar esta empresa?')) {
      return;
    }

    this.companyService.deleteCompany(companyId).subscribe({
      next: () => {
        console.log('✅ Empresa eliminada');
        this.successMessage = 'Empresa eliminada exitosamente';
        this.loadCompanies();
      },
      error: (error: any) => {
        console.error('❌ Error al eliminar:', error);
        this.errorMessage = 'Error al eliminar la empresa';
      }
    });
  }
}