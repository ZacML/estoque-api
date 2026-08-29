import { Injectable, OnDestroy, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { BASE_URL } from './api.service';

/** Eventos publicados pelo EventoService do back-end. */
export type EventoNome =
  | 'conectado'
  | 'doca:status_changed'
  | 'dock:released'
  | 'doca:removed'
  | 'street:occupancy_updated'
  | 'posicao:removed'
  | 'pallet:stored'
  | 'estoque:removed'
  | 'movimentacao:created'
  | 'movimentacao:updated'
  | 'movimentacao:removed'
  | 'movimentacao:conferida'
  | 'movimentacao:autorizada'
  | 'movimentacao:enderecada';

export interface EventoRecebido<T = unknown> {
  nome: EventoNome;
  payload: T;
}

const EVENTOS: EventoNome[] = [
  'conectado',
  'doca:status_changed',
  'dock:released',
  'doca:removed',
  'street:occupancy_updated',
  'posicao:removed',
  'pallet:stored',
  'estoque:removed',
  'movimentacao:created',
  'movimentacao:updated',
  'movimentacao:removed',
  'movimentacao:conferida',
  'movimentacao:autorizada',
  'movimentacao:enderecada',
];

/**
 * Conexão SSE única com o back-end. Toda tela que precisa reagir a uma ação
 * feita no app coletor assina `eventos$` e chama o próprio refresh().
 */
@Injectable({ providedIn: 'root' })
export class RealtimeService implements OnDestroy {
  private source?: EventSource;
  private reconectarEm?: ReturnType<typeof setTimeout>;

  readonly conectado = signal(false);
  readonly eventos$ = new Subject<EventoRecebido>();

  constructor() {
    this.conectar();
  }

  private conectar() {
    if (typeof EventSource === 'undefined') return;

    this.source = new EventSource(`${BASE_URL}/eventos/stream`);

    this.source.onopen = () => this.conectado.set(true);

    this.source.onerror = () => {
      this.conectado.set(false);
      this.source?.close();
      // o back-end derruba o emitter a cada 30 min; reconectamos sozinhos
      this.reconectarEm = setTimeout(() => this.conectar(), 5000);
    };

    for (const nome of EVENTOS) {
      this.source.addEventListener(nome, (ev) => {
        const payload = this.parse((ev as MessageEvent).data);
        this.conectado.set(true);
        this.eventos$.next({ nome, payload });
      });
    }
  }

  private parse(data: string): unknown {
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }

  ngOnDestroy() {
    clearTimeout(this.reconectarEm);
    this.source?.close();
  }
}
