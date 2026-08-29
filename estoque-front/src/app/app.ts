import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ThemeService } from './core/theme.service';
import { IconComponent } from './shared/icon.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly theme = inject(ThemeService);

  protected readonly navItems = [
    { path: 'dashboard', label: 'Dashboard', icon: 'grid' as const },
    { path: 'ruas', label: 'Ruas & Posições', icon: 'bars' as const },
    { path: 'docas', label: 'Docas', icon: 'truck' as const },
    { path: 'produtos', label: 'Produtos', icon: 'box' as const },
    { path: 'movimentacoes', label: 'Movimentações', icon: 'swap' as const },
  ];
}
