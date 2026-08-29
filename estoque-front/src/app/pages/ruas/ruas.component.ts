import { Component, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { Estoque, Posicao, Produto, Rua } from '../../core/models';
import { occupancyTier } from '../../core/occupancy';
import { IconComponent } from '../../shared/icon.component';
import { ModalComponent } from '../../shared/modal.component';

type Filtro = 'todas' | 'livres' | 'ocupadas';

@Component({
  selector: 'app-ruas',
  standalone: true,
  imports: [IconComponent, ModalComponent],
  templateUrl: './ruas.component.html',
  styleUrl: './ruas.component.scss',
})
export class RuasComponent {
  private api = inject(ApiService);

  ruas = signal<Rua[]>([]);
  posicoes = signal<Posicao[]>([]);
  estoques = signal<Estoque[]>([]);
  produtos = signal<Produto[]>([]);

  searchTerm = signal('');
  filtro = signal<Filtro>('todas');
  selecionada = signal<Posicao | null>(null);
  lastUpdated = signal(new Date());

  produtoMap = computed(() => new Map(this.produtos().map((p) => [p.id, p])));

  totalOcupadas = computed(() => this.posicoes().filter((p) => p.ocupada).length);
  totalLivres = computed(() => this.posicoes().length - this.totalOcupadas());

  ruasFiltradas = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    return this.ruas().filter((r) => !term || r.codigo.toLowerCase().includes(term) || r.categoria.toLowerCase().includes(term));
  });

  cards = computed(() =>
    this.ruasFiltradas().map((rua) => {
      let posicoesRua = this.posicoes()
        .filter((p) => p.ruaId === rua.id)
        .sort((a, b) => a.numero - b.numero);

      if (this.filtro() === 'livres') posicoesRua = posicoesRua.filter((p) => !p.ocupada);
      if (this.filtro() === 'ocupadas') posicoesRua = posicoesRua.filter((p) => p.ocupada);

      const total = this.posicoes().filter((p) => p.ruaId === rua.id).length;
      const ocupadas = this.posicoes().filter((p) => p.ruaId === rua.id && p.ocupada).length;
      const pct = total === 0 ? 0 : Math.round((ocupadas / total) * 100);

      return { rua, posicoes: posicoesRua, total, ocupadas, pct, tier: occupancyTier(pct) };
    }),
  );

  estoqueDaPosicao = computed(() => {
    const pos = this.selecionada();
    if (!pos) return null;
    const est = this.estoques().find((e) => e.posicaoId === pos.id);
    if (!est) return null;
    return { estoque: est, produto: this.produtoMap().get(est.produtoId) };
  });

  constructor() {
    this.refresh();
  }

  refresh() {
    forkJoin({
      ruas: this.api.listarRuas(),
      posicoes: this.api.listarPosicoes(),
      estoques: this.api.listarEstoques(),
      produtos: this.api.listarProdutos(),
    }).subscribe((data) => {
      this.ruas.set(data.ruas);
      this.posicoes.set(data.posicoes);
      this.estoques.set(data.estoques);
      this.produtos.set(data.produtos);
      this.lastUpdated.set(new Date());
    });
  }

  cicleFiltro() {
    const ordem: Filtro[] = ['todas', 'livres', 'ocupadas'];
    const atual = ordem.indexOf(this.filtro());
    this.filtro.set(ordem[(atual + 1) % ordem.length]);
  }

  horaAtualizacao(): string {
    return this.lastUpdated().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
}
