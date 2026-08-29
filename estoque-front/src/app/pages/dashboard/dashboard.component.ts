import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { Doca, Movimentacao, Posicao, Produto, Rua } from '../../core/models';
import { occupancyTier } from '../../core/occupancy';
import { RealtimeService } from '../../core/realtime.service';
import { IconComponent } from '../../shared/icon.component';
import { ModalComponent } from '../../shared/modal.component';
import { MovimentacaoFormComponent } from '../../shared/movimentacao-form.component';
import { NotificacoesComponent } from '../../shared/notificacoes.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, IconComponent, ModalComponent, MovimentacaoFormComponent, NotificacoesComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private api = inject(ApiService);
  private realtime = inject(RealtimeService);

  ruas = signal<Rua[]>([]);
  posicoes = signal<Posicao[]>([]);
  docas = signal<Doca[]>([]);
  produtos = signal<Produto[]>([]);
  movimentacoes = signal<Movimentacao[]>([]);
  pendentes = signal<Movimentacao[]>([]);

  showForm = signal(false);
  searchTerm = signal('');

  produtoMap = computed(() => new Map(this.produtos().map((p) => [p.id, p])));
  ruaMap = computed(() => new Map(this.ruas().map((r) => [r.id, r])));
  posicaoMap = computed(() => new Map(this.posicoes().map((p) => [p.id, p])));

  totalPosicoes = computed(() => this.posicoes().length);
  posicoesOcupadas = computed(() => this.posicoes().filter((p) => p.ocupada).length);
  ocupacaoPct = computed(() =>
    this.totalPosicoes() === 0 ? 0 : Math.round((this.posicoesOcupadas() / this.totalPosicoes()) * 100),
  );
  posicoesLivres = computed(() => this.totalPosicoes() - this.posicoesOcupadas());
  ruasComVaga = computed(() => new Set(this.posicoes().filter((p) => !p.ocupada).map((p) => p.ruaId)).size);

  docasEmUso = computed(() => this.docas().filter((d) => d.ocupada).length);
  docasLivres = computed(() => this.docas().length - this.docasEmUso());

  greeting = computed(() => {
    const h = new Date().getHours();
    return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  });

  ocupacaoPorRua = computed(() =>
    this.ruas().map((rua) => {
      const nesta = this.posicoes().filter((p) => p.ruaId === rua.id);
      const pct = nesta.length === 0 ? 0 : Math.round((nesta.filter((p) => p.ocupada).length / nesta.length) * 100);
      return { rua, pct, tier: occupancyTier(pct) };
    }),
  );

  movimentacoesHoje = computed(() => {
    const hoje = new Date().toDateString();
    const term = this.searchTerm().trim().toLowerCase();
    return this.movimentacoes()
      .filter((m) => new Date(m.dataHora).toDateString() === hoje)
      .filter((m) => this.matchesSearch(m, term))
      .sort((a, b) => +new Date(b.dataHora) - +new Date(a.dataHora));
  });

  pendentesFiltradas = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    return this.pendentes().filter((m) => this.matchesSearch(m, term));
  });

  constructor() {
    this.refresh();
    // Qualquer ação feita no app coletor cai aqui e redesenha os indicadores.
    this.realtime.eventos$.pipe(takeUntilDestroyed()).subscribe(({ nome }) => {
      if (nome !== 'conectado') this.refresh();
    });
  }

  private matchesSearch(m: Movimentacao, term: string): boolean {
    if (!term) return true;
    const produto = this.produtoMap().get(m.produtoId)?.nome ?? '';
    const rua = m.posicaoId ? this.ruaMap().get(this.posicaoMap().get(m.posicaoId)?.ruaId ?? -1)?.codigo ?? '' : '';
    const haystack = `${produto} ${m.nota ?? ''} ${m.placa ?? ''} ${rua}`.toLowerCase();
    return haystack.includes(term);
  }

  refresh() {
    forkJoin({
      ruas: this.api.listarRuas(),
      posicoes: this.api.listarPosicoes(),
      docas: this.api.listarDocas(),
      produtos: this.api.listarProdutos(),
      movimentacoes: this.api.listarMovimentacoes(),
      pendentes: this.api.listarSaidasPendentes(),
    }).subscribe((data) => {
      this.ruas.set(data.ruas);
      this.posicoes.set(data.posicoes);
      this.docas.set(data.docas);
      this.produtos.set(data.produtos);
      this.movimentacoes.set(data.movimentacoes);
      this.pendentes.set(data.pendentes);
    });
  }

  movimentoLabel(m: Movimentacao): string {
    const produto = this.produtoMap().get(m.produtoId);
    const unidade = produto?.unidade ?? '';
    return `${m.saida ? 'Saída' : 'Entrada'} · ${m.quantidade} ${unidade} ${produto?.nome ?? ''}`.trim();
  }

  movimentoSubtitulo(m: Movimentacao): string {
    if (m.posicaoId) {
      const pos = this.posicaoMap().get(m.posicaoId);
      const rua = pos ? this.ruaMap().get(pos.ruaId) : undefined;
      return `Rua ${rua?.codigo ?? '?'} · pos. ${pos?.numero ?? '?'}`;
    }
    if (m.docaId) {
      const doca = this.docas().find((d) => d.id === m.docaId);
      return `Doca ${doca?.numero ?? '?'}${m.placa ? ' · placa ' + m.placa : ''}`;
    }
    return '';
  }

  hora(dataHora: string): string {
    return new Date(dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  onNovaMovimentacao(payload: Partial<Movimentacao>) {
    this.api.salvarMovimentacao(payload).subscribe(() => {
      const doca = payload.docaId ? this.docas().find((d) => d.id === payload.docaId) : null;
      if (doca && !doca.ocupada) {
        this.api.atualizarDoca(doca.id, { ...doca, ocupada: true }).subscribe(() => this.refresh());
      } else {
        this.refresh();
      }
      this.showForm.set(false);
    });
  }

  liberar(mov: Movimentacao) {
    this.api.autorizarSaida(mov.id).subscribe(() => {
      const doca = mov.docaId ? this.docas().find((d) => d.id === mov.docaId) : null;
      if (doca && doca.ocupada) {
        this.api.atualizarDoca(doca.id, { ...doca, ocupada: false }).subscribe(() => this.refresh());
      } else {
        this.refresh();
      }
    });
  }
}
