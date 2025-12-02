import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { NavbarComponent } from './components/navbar/navbar';
import { FeedComponent } from './components/feed/feed';
import { PostCreateComponent } from './components/post-create/post-create';
import { UserSearchComponent } from './components/user-search/user-search';
import { ChatListComponent } from './components/chat-list/chat-list';
import { ProfileComponent } from './components/profile/profile';
import { RegisterComponent } from './components/register/register';
import { LoginComponent } from './components/login/login';
import { LandingComponent } from './components/landing/landing';
import { CompanyList } from './components/company-list/company-list';
import { CompanyDetail } from './components/company-detail/company-detail';

@NgModule({
  declarations: [
    App,
    NavbarComponent,
    FeedComponent,
    PostCreateComponent,
    UserSearchComponent,
    ChatListComponent,
    ProfileComponent,
    RegisterComponent,
    LoginComponent,
    LandingComponent,
    CompanyList,
    CompanyDetail
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    AppRoutingModule,
    MatToolbarModule,
    MatButtonModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptorsFromDi())
  ],
  bootstrap: [App]
})
export class AppModule { }