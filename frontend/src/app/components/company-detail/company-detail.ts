import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyService } from '../../services/company';
import { ProductService } from '../../services/product';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-company-detail',
  standalone: false,
  templateUrl: './company-detail.html',
  styleUrl: './company-detail.css',
})
export class CompanyDetail implements OnInit {
  company: any = null;
  currentUser: any = null;
  loading: boolean = false;
  
  // ===== PRODUCTOS =====
  products: any[] = [];
  showProductForm: boolean = false;
  editingProduct: any = null;
  newProduct = {
    name: '',
    description: '',
    price: 0,
    image: '',
    category: 'suplementos',
    stock: 0
  };
  productErrorMessage: string = '';
  productSuccessMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private companyService: CompanyService,
    private productService: ProductService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    const companyId = this.route.snapshot.paramMap.get('id');
    
    if (companyId) {
      this.loadCompany(companyId);
      this.loadProducts(companyId);
    }
  }

  loadCompany(id: string): void {
    this.loading = true;
    this.companyService.getCompanyById(id).subscribe({
      next: (company: any) => {
        console.log('✅ Empresa cargada:', company);
        this.company = company;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('❌ Error al cargar empresa:', error);
        this.loading = false;
      }
    });
  }

  loadProducts(companyId: string): void {
    this.productService.getProductsByCompany(companyId).subscribe({
      next: (products: any) => {
        console.log('✅ Productos cargados:', products);
        this.products = products;
      },
      error: (error: any) => {
        console.error('❌ Error al cargar productos:', error);
      }
    });
  }

  isMyCompany(): boolean {
    if (!this.currentUser || !this.company) return false;
    const ownerId = this.company.owner_id?._id || this.company.owner_id;
    return ownerId === this.currentUser._id;
  }

  isFollowing(): boolean {
    if (!this.currentUser || !this.company) return false;
    return this.company.followers?.some((f: any) => {
      const followerId = f._id || f;
      return followerId === this.currentUser._id;
    });
  }

  toggleFollow(): void {
    if (!this.currentUser) {
      alert('Debes iniciar sesión');
      return;
    }

    if (this.isFollowing()) {
      this.companyService.unfollowCompany(this.company._id, this.currentUser._id).subscribe({
        next: () => {
          this.loadCompany(this.company._id);
        }
      });
    } else {
      this.companyService.followCompany(this.company._id, this.currentUser._id).subscribe({
        next: () => {
          this.loadCompany(this.company._id);
        }
      });
    }
  }

  // ===== GESTIÓN DE PRODUCTOS =====
  
  toggleProductForm(): void {
    this.showProductForm = !this.showProductForm;
    this.productErrorMessage = '';
    this.productSuccessMessage = '';
    this.editingProduct = null;
    
    if (!this.showProductForm) {
      this.resetProductForm();
    }
  }

  resetProductForm(): void {
    this.newProduct = {
      name: '',
      description: '',
      price: 0,
      image: '',
      category: 'suplementos',
      stock: 0
    };
    this.editingProduct = null;
  }

  createProduct(): void {
    this.productErrorMessage = '';
    this.productSuccessMessage = '';

    // Verificación exhaustiva
    console.log('=== CREAR PRODUCTO ===');
    console.log('Company completa:', this.company);
    console.log('Company ID:', this.company?._id);
    console.log('Nuevo producto:', this.newProduct);

    if (!this.company || !this.company._id) {
      this.productErrorMessage = 'Error: No se pudo obtener el ID de la empresa';
      return;
    }

    if (!this.newProduct.name || this.newProduct.price <= 0) {
      this.productErrorMessage = 'El nombre y precio son obligatorios y el precio debe ser mayor a 0';
      return;
    }

    const productData = {
      name: this.newProduct.name,
      description: this.newProduct.description,
      price: this.newProduct.price,
      image: this.newProduct.image,
      category: this.newProduct.category,
      stock: this.newProduct.stock,
      company_id: this.company._id
    };

    console.log('Datos a enviar:', productData);

    if (this.editingProduct) {
      // Actualizar producto existente
      this.productService.updateProduct(this.editingProduct._id, this.newProduct).subscribe({
        next: (response: any) => {
          console.log('✅ Producto actualizado:', response);
          this.productSuccessMessage = 'Producto actualizado exitosamente';
          this.resetProductForm();
          this.showProductForm = false;
          this.loadProducts(this.company._id);
        },
        error: (error: any) => {
          console.error('❌ Error completo:', error);
          console.error('❌ Error detalle:', error.error);
          this.productErrorMessage = error.error?.error || error.error?.detalle || 'Error al actualizar el producto';
        }
      });
    } else {
      // Crear nuevo producto
      this.productService.createProduct(productData).subscribe({
        next: (response: any) => {
          console.log('✅ Producto creado:', response);
          this.productSuccessMessage = 'Producto creado exitosamente';
          this.resetProductForm();
          this.showProductForm = false;
          this.loadProducts(this.company._id);
        },
        error: (error: any) => {
          console.error('❌ Error completo:', error);
          console.error('❌ Error status:', error.status);
          console.error('❌ Error detalle:', error.error);
          this.productErrorMessage = error.error?.error || error.error?.detalle || 'Error al crear el producto';
        }
      });
    }
  }

  editProduct(product: any): void {
    this.editingProduct = product;
    this.newProduct = {
      name: product.name,
      description: product.description || '',
      price: product.price,
      image: product.image || '',
      category: product.category || 'suplementos',
      stock: product.stock || 0
    };
    this.showProductForm = true;
    this.productErrorMessage = '';
    this.productSuccessMessage = '';
  }

  deleteProduct(productId: string): void {
    if (!confirm('¿Estás seguro de eliminar este producto?')) {
      return;
    }

    this.productService.deleteProduct(productId).subscribe({
      next: () => {
        console.log('✅ Producto eliminado');
        this.productSuccessMessage = 'Producto eliminado exitosamente';
        this.loadProducts(this.company._id);
      },
      error: (error: any) => {
        console.error('❌ Error al eliminar producto:', error);
        this.productErrorMessage = 'Error al eliminar el producto';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/companies']);
  }
}