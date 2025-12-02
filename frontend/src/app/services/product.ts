import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  // Obtener productos de una empresa
  getProductsByCompany(companyId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/company/${companyId}`);
  }

  // Obtener todos los productos
  getAllProducts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/all`);
  }

  // Crear producto
  createProduct(product: any): Observable<any> {
    return this.http.post(this.baseUrl, product);
  }

  // Actualizar producto
  updateProduct(productId: string, product: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${productId}`, product);
  }

  // Eliminar producto
  deleteProduct(productId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${productId}`);
  }

  // Obtener un producto específico
  getProductById(productId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${productId}`);
  }
}