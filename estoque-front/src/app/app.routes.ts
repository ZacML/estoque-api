import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'ruas',
    loadComponent: () => import('./pages/ruas/ruas.component').then((m) => m.RuasComponent),
  },
  {
    path: 'docas',
    loadComponent: () => import('./pages/docas/docas.component').then((m) => m.DocasComponent),
  },
  {
    path: 'produtos',
    loadComponent: () => import('./pages/produtos/produtos.component').then((m) => m.ProdutosComponent),
  },
  {
    path: 'movimentacoes',
    loadComponent: () =>
      import('./pages/movimentacoes/movimentacoes.component').then((m) => m.MovimentacoesComponent),
  },
  { path: '**', redirectTo: 'dashboard' },
];
