import { Injectable, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ApiService } from './api.service';
import { Doca, Estoque, Movimentacao, Posicao, Produto, Rua } from './models';
import { RealtimeService } from './realtime.service';

export type NotificacaoTipo = 'aprovada' | 'estoque' | 'doca' | 'chegada' | 'pendente';

export interface Notificacao {
  id: string;
  tipo: NotificacaoTipo;
  titulo: string;
  descricao: string;
  hora: Date;
  lida: boolean;
}

const LIMITE = 30;

/**
 * Central de notificações do painel.
 * Escuta o canal SSE e avisa, principalmente, quando uma carga foi
 * aprovada/liberada para entrar no estoque ou foi guardada numa posição.
 */
@Injectable({ providedIn: 'root' })
export class NotificacoesService {
  private api = inject(ApiService);
  private realtime = inject(RealtimeService);

  private produtos = signal<Produto[]>([]);
  private posicoes = signal<Posicao[]>([]);
  private ruas = signal<Rua[]>([]);
  private docas = signal<Doca[]>([]);

  readonly lista = signal<Notificacao[]>([]);
  readonly naoLidas = computed(() => this.lista().filter((n) => !n.lida).length);
  readonly conectado = this.realtime.conectado;

  constructor() {
    this.carregarCatalogos();
    this.carregarPendentes();

    this.realtime.eventos$.subscribe(({ nome, payload }) => {
      switch (nome) {
        case 'movimentacao:autorizada':
          this.aoAutorizar(payload as Movimentacao);
          break;
        // 'movimentacao:enderecada' vem junto de 'pallet:stored'; um aviso basta.
        case 'pallet:stored':
          this.aoGuardar(payload as Estoque);
          break;
        case 'dock:released':
          this.push('doca', 'Doca liberada', `Doca ${(payload as Doca).numero} voltou a ficar livre.`);
          break;
        case 'movimentacao:created':
          this.aoCriar(payload as Movimentacao);
          break;
        case 'street:occupancy_updated':
          this.recarregarPosicoes();
          break;
      }
    });
  }

  marcarTodasLidas() {
    this.lista.update((ns) => ns.map((n) => ({ ...n, lida: true })));
  }

  limpar() {
    this.lista.set([]);
  }

  // ---------------------------------------------------------------- eventos

  private aoAutorizar(mov: Movimentacao) {
    const produto = this.nomeProduto(mov.produtoId);
    const destino = mov.saida ? 'Saída autorizada' : 'Entrada aprovada para o estoque';
    this.push(
      'aprovada',
      destino,
      `${produto} · ${mov.quantidade} ${this.unidade(mov.produtoId)}${mov.nota ? ` · nota ${mov.nota}` : ''}`,
    );
  }

  private aoGuardar(estoque: Estoque) {
    this.push(
      'estoque',
      'Palete guardado no estoque',
      `${this.nomeProduto(estoque.produtoId)} em ${this.enderecoLegivel(estoque.posicaoId)}.`,
    );
    this.recarregarPosicoes();
  }

  private aoCriar(mov: Movimentacao) {
    if (mov.saida) {
      this.push('pendente', 'Saída aguardando liberação', `${this.nomeProduto(mov.produtoId)} · placa ${mov.placa ?? '—'}`);
    } else {
      this.push('chegada', 'Chegada registrada', `${this.nomeProduto(mov.produtoId)} · ${this.nomeDoca(mov.docaId)}`);
    }
  }

  // ------------------------------------------------------------------ dados

  private carregarCatalogos() {
    forkJoin({
      produtos: this.api.listarProdutos(),
      posicoes: this.api.listarPosicoes(),
      ruas: this.api.listarRuas(),
      docas: this.api.listarDocas(),
    }).subscribe({
      next: (d) => {
        this.produtos.set(d.produtos);
        this.posicoes.set(d.posicoes);
        this.ruas.set(d.ruas);
        this.docas.set(d.docas);
      },
      error: () => undefined,
    });
  }

  private recarregarPosicoes() {
    this.api.listarPosicoes().subscribe({ next: (p) => this.posicoes.set(p), error: () => undefined });
  }

  /** Mostra as pendências que já existiam antes de a tela abrir. */
  private carregarPendentes() {
    this.api.listarSaidasPendentes().subscribe({
      next: (movs) =>
        movs.forEach((m) =>
          this.push(
            'pendente',
            'Saída aguardando liberação',
            `${this.nomeProduto(m.produtoId)} · placa ${m.placa ?? '—'}`,
            new Date(m.dataHora),
          ),
        ),
      error: () => undefined,
    });
  }

  private push(tipo: NotificacaoTipo, titulo: string, descricao: string, hora = new Date()) {
    const nova: Notificacao = {
      id: `${tipo}-${hora.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
      tipo,
      titulo,
      descricao,
      hora,
      lida: false,
    };
    this.lista.update((ns) => [nova, ...ns].slice(0, LIMITE));
  }

  // -------------------------------------------------------------- formatação

  private nomeProduto(id: number | null | undefined): string {
    return this.produtos().find((p) => p.id === id)?.nome ?? 'Produto';
  }

  private unidade(id: number | null | undefined): string {
    return this.produtos().find((p) => p.id === id)?.unidade ?? '';
  }

  private nomeDoca(id: number | null | undefined): string {
    const doca = this.docas().find((d) => d.id === id);
    return doca ? `Doca ${doca.numero}` : 'sem doca';
  }

  private enderecoLegivel(posicaoId: number | null | undefined): string {
    const pos = this.posicoes().find((p) => p.id === posicaoId);
    if (!pos) return 'posição não informada';
    const rua = this.ruas().find((r) => r.id === pos.ruaId);
    return `${rua?.codigo ?? 'Rua ?'} · posição ${pos.numero}`;
  }
}
