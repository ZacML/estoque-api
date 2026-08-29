import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { Doca, Movimentacao, Posicao, Produto, Rua } from '../../core/models';
import { RealtimeService } from '../../core/realtime.service';
import { IconComponent } from '../../shared/icon.component';
import { ModalComponent } from '../../shared/modal.component';
import { MovimentacaoFormComponent } from '../../shared/movimentacao-form.component';

@Component({
  selector: 'app-movimentacoes',
  standalone: true,
  imports: [IconComponent, ModalComponent, MovimentacaoFormComponent],
  templateUrl: './movimentacoes.component.html',
  styleUrl: './movimentacoes.component.scss',
})
export class MovimentacoesComponent {
  private api = inject(ApiService);
  private realtime = inject(RealtimeService);

  movimentacoes = signal<Movimentacao[]>([]);
  produtos = signal<Produto[]>([]);
  posicoes = signal<Posicao[]>([]);
  ruas = signal<Rua[]>([]);
  docas = signal<Doca[]>([]);

  searchTerm = signal('');

  /** undefined = modal fechado · null = nova · Movimentacao = edição */
  editando = signal<Movimentacao | null | undefined>(undefined);
  excluindo = signal<Movimentacao | null>(null);
  erro = signal('');

  produtoMap = computed(() => new Map(this.produtos().map((p) => [p.id, p])));

  lista = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    return this.movimentacoes()
      .filter((m) => {
        if (!term) return true;
        const produto = this.produtoMap().get(m.produtoId)?.nome ?? '';
        return `${produto} ${m.nota ?? ''} ${m.placa ?? ''}`.toLowerCase().includes(term);
      })
      .sort((a, b) => +new Date(b.dataHora) - +new Date(a.dataHora));
  });

  constructor() {
    this.refresh();
    this.realtime.eventos$.pipe(takeUntilDestroyed()).subscribe(({ nome }) => {
      if (nome !== 'conectado') this.refresh();
    });
  }

  refresh() {
    forkJoin({
      movimentacoes: this.api.listarMovimentacoes(),
      produtos: this.api.listarProdutos(),
      posicoes: this.api.listarPosicoes(),
      ruas: this.api.listarRuas(),
      docas: this.api.listarDocas(),
    }).subscribe((data) => {
      this.movimentacoes.set(data.movimentacoes);
      this.produtos.set(data.produtos);
      this.posicoes.set(data.posicoes);
      this.ruas.set(data.ruas);
      this.docas.set(data.docas);
    });
  }

  dataHoraFmt(v: string): string {
    return new Date(v).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  }

  status(m: Movimentacao): string {
    if (!m.saida) return m.conferida ? 'Conferida no coletor' : 'Entrada registrada';
    return m.liberada ? 'Liberada' : m.autorizada ? 'Autorizada' : 'Aguardando liberação';
  }

  /** Diferença entre o que a nota declarou e o que o operador contou. */
  divergencia(m: Movimentacao): number | null {
    if (m.quantidadeConferida === null || m.quantidadeConferida === undefined) return null;
    const diff = m.quantidadeConferida - m.quantidade;
    return diff === 0 ? null : diff;
  }

  endereco(m: Movimentacao): string {
    if (!m.posicaoId) return '—';
    const pos = this.posicoes().find((p) => p.id === m.posicaoId);
    if (!pos) return '—';
    const rua = this.ruas().find((r) => r.id === pos.ruaId);
    return `${rua?.codigo ?? '?'} · ${pos.numero}`;
  }

  // ------------------------------------------------------------------ CRUD

  nova() {
    this.erro.set('');
    this.editando.set(null);
  }

  editar(m: Movimentacao) {
    this.erro.set('');
    this.editando.set(m);
  }

  onSubmit(payload: Partial<Movimentacao>) {
    const atual = this.editando();
    const req = atual
      ? this.api.atualizarMovimentacao(atual.id, payload)
      : this.api.salvarMovimentacao(payload);

    req.subscribe({
      next: () => {
        this.editando.set(undefined);
        this.refresh();
      },
      error: (e) => this.erro.set(e?.error?.mensagem ?? 'Não foi possível salvar a movimentação.'),
    });
  }

  confirmarExclusao(m: Movimentacao) {
    this.erro.set('');
    this.excluindo.set(m);
  }

  excluir() {
    const m = this.excluindo();
    if (!m) return;
    this.api.deletarMovimentacao(m.id).subscribe({
      next: () => {
        this.excluindo.set(null);
        this.refresh();
      },
      error: (e) => this.erro.set(e?.error?.mensagem ?? 'Não foi possível excluir a movimentação.'),
    });
  }

  liberar(m: Movimentacao) {
    this.api.autorizarSaida(m.id).subscribe(() => this.refresh());
  }
}
