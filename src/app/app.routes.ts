import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MetasComponent } from './pages/metas/metas.component';
import { TransacoesComponent } from './pages/transacoes/transacoes.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'metas', component: MetasComponent },
  { path: 'transacoes', component: TransacoesComponent },
  { path: '**', redirectTo: '/login' }
];