import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MetasComponent } from './pages/metas/metas.component';
import { TransacoesComponent } from './pages/transacoes/transacoes.component';
import { MyAccountsComponent } from './pages/my-accounts/my-accounts.component';
import { BankLoginComponent } from './pages/bank-login/bank-login.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'my-accounts', component: MyAccountsComponent, canActivate: [AuthGuard] },
  { path: 'metas', component: MetasComponent, canActivate: [AuthGuard] },
  { path: 'transacoes', component: TransacoesComponent, canActivate: [AuthGuard] },
  { path: 'bank-login', component: BankLoginComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/login' }
];