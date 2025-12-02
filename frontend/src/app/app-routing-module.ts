import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { FeedComponent } from './components/feed/feed';
import { PostCreateComponent } from './components/post-create/post-create';
import { UserSearchComponent } from './components/user-search/user-search';
import { ChatListComponent } from './components/chat-list/chat-list';
import { ProfileComponent } from './components/profile/profile';
import { CompanyList } from './components/company-list/company-list';
import { CompanyDetail } from './components/company-detail/company-detail';

const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'feed', component: FeedComponent },
  { path: 'create', component: PostCreateComponent },
  { path: 'search', component: UserSearchComponent },
  { path: 'chats', component: ChatListComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'companies', component: CompanyList },
  { path: 'company/:id', component: CompanyDetail },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }