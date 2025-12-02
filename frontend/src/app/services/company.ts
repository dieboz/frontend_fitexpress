import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private baseUrl = `${environment.apiUrl}/companies`;

  constructor(private http: HttpClient) {}

  getAllCompanies(): Observable<any> {
    return this.http.get(`${this.baseUrl}/all`);
  }

  getCompanyById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  createCompany(company: any): Observable<any> {
    return this.http.post(this.baseUrl, company);
  }

  updateCompany(companyId: string, company: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${companyId}`, company);
  }

  deleteCompany(companyId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${companyId}`);
  }

  followCompany(companyId: string, userId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${companyId}/follow`, { user_id: userId });
  }

  unfollowCompany(companyId: string, userId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${companyId}/follow`, { 
      body: { user_id: userId } 
    });
  }
}