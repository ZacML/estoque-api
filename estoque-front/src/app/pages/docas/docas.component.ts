import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { Doca, Movimentacao, Produto } from '../../core/models';
import { RealtimeService } from '../../core/realtime.service';
import { IconComponent } from '../../shared/icon.component';
import { ModalComponent } from '../../shared/modal.component';
import { MovimentacaoFormComponent } from '../../shared/movimentacao-form.component';

@Component({
  selector: 'app-docas',
  standalone: true,
  imports: [IconComponent, ModalComponent, MovimentacaoFormComponent],
  templateUrl: './docas.component.html',
  styleUrl: './docas.component.scss',
})
export class DocasComponent {
  private api = inject(ApiService);
  private realtime = inject(RealtimeService);

  docas = signal<Doca[]>([]);
  movimentacoes = signal<Movimentacao[]>([]);
  produtos = signal<Produto[]>([]);

  searchTerm = signal('');
  chegadaParaDoca = signal<Doca | null | undefined>(undefined);
  notaSelecionada = signal<Movimentacao | null>(null);
  erro = signal('');

  produtoMap = computed(() => new Map(this.produtos().map((p) => [p.id, p])));

  docasLivres = computed(() => this.docas().filter((d) => !d.ocupada).length);
  docasEmUso = computed(() => this.docas().filter((d) => d.ocupada).length);

  cards = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    return this.docas()
      .map((doca) => {
        const movs = this.movimentacoes()
          .filter((m) => m.docaId === doca.id)
          .sort((a, b) => +new Date(b.dataHora) - +new Date(a.dataHora));
        const atual = movs[0] ?? null;
        return { doca, movimentacao: atual };
      })
      .filter(({ movimentacao }) => {
        if (!term) return true;
        return (movimentacao?.placa ?? '').toLowerCase().includes(term) || (movimentacao?.nota ?? '').toLowerCase().includes(term);
      });
  });

  constructor() {
    this.refresh();
    // A doca liberada no app precisa aparecer como "Livre" aqui na hora.
    this.realtime.eventos$.pipe(takeUntilDestroyed()).subscribe(({ nome }) => {
      if (nome !== 'conectado') this.refresh();
    });
  }

  refresh() {
    forkJoin({
      docas: this.api.listarDocas(),
      movimentacoes: this.api.listarMovimentacoes(),
      produtos: this.api.listarProdutos(),
    }).subscribe({
      next: (data) => {
        this.docas.set(data.docas);
        this.movimentacoes.set(data.movimentacoes);
        this.produtos.set(data.produtos);
        this.erro.set('');
      },
      error: (e) => this.erro.set(e?.error?.mensagem ?? 'Não foi possível carregar os dados.'),
    });
  }

  subtitulo(doca: Doca): string {
    return doca.expedicao ? 'Expedição' : 'Recebimento';
  }

  cargaLabel(m: Movimentacao): string {
    const produto = this.produtoMap().get(m.produtoId);
    return `${m.quantidade} ${produto?.unidade ?? ''} · ${produto?.nome ?? ''}`.trim();
  }

  precisaAutorizar(m: Movimentacao | null): boolean {
    return !!m && m.saida && !m.autorizada;
  }

  autorizar(doca: Doca, m: Movimentacao) {
    this.api.autorizarSaida(m.id).subscribe(() => {
      this.api.atualizarDoca(doca.id, { ...doca, ocupada: false }).subscribe(() => this.refresh());
    });
  }

  onRegistrarChegada(payload: Partial<Movimentacao>) {
    this.api.salvarMovimentacao(payload).subscribe({
      next: () => {
        const docaId = payload.docaId;
        const doca = docaId ? this.docas().find((d) => d.id === docaId) : null;
        if (doca) {
          this.api.atualizarDoca(doca.id, { ...doca, ocupada: true }).subscribe(() => this.refresh());
        } else {
          this.refresh();
        }
        this.chegadaParaDoca.set(undefined);
      },
      error: (e) => this.erro.set(e?.error?.mensagem ?? 'Não foi possível registrar a chegada.'),
    });
  }
}
