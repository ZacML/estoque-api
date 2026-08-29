import { Component, inject, signal } from '@angular/core';
import { NotificacoesService } from '../core/notificacoes.service';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-notificacoes',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="wrap">
      <button
        class="btn btn-icon sino"
        type="button"
        [attr.aria-label]="'Notificações (' + notificacoes.naoLidas() + ' não lidas)'"
        [attr.aria-expanded]="aberto()"
        (click)="alternar()"
      >
        <app-icon name="bell" />
        @if (notificacoes.naoLidas() > 0) {
          <span class="contador">{{ notificacoes.naoLidas() }}</span>
        }
      </button>

      @if (aberto()) {
        <div class="backdrop" (click)="fechar()"></div>
        <div class="painel" role="dialog" aria-label="Notificações">
          <div class="painel-head">
            <strong>Notificações</strong>
            <span class="pill" [class.pill-green]="notificacoes.conectado()" [class.pill-gray]="!notificacoes.conectado()">
              {{ notificacoes.conectado() ? 'ao vivo' : 'offline' }}
            </span>
          </div>

          @if (notificacoes.lista().length === 0) {
            <p class="vazio">Nada por aqui ainda.</p>
          } @else {
            <ul class="itens">
              @for (n of notificacoes.lista(); track n.id) {
                <li [class.nao-lida]="!n.lida">
                  <span class="marcador" [class]="'tipo-' + n.tipo"></span>
                  <div class="texto">
                    <strong>{{ n.titulo }}</strong>
                    <span>{{ n.descricao }}</span>
                  </div>
                  <time>{{ hora(n.hora) }}</time>
                </li>
              }
            </ul>
            <div class="painel-foot">
              <button class="btn" type="button" (click)="notificacoes.limpar()">Limpar</button>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .wrap {
        position: relative;
      }
      .sino {
        position: relative;
      }
      .contador {
        position: absolute;
        top: -0.3rem;
        right: -0.3rem;
        min-width: 1.15rem;
        height: 1.15rem;
        padding: 0 0.25rem;
        border-radius: 999px;
        background: var(--red);
        color: #fff;
        font-size: 0.7rem;
        font-weight: 700;
        line-height: 1.15rem;
        text-align: center;
      }
      .backdrop {
        position: fixed;
        inset: 0;
        z-index: 40;
      }
      .painel {
        position: absolute;
        right: 0;
        top: calc(100% + 0.5rem);
        width: min(22rem, calc(100vw - 2rem));
        max-height: 24rem;
        overflow-y: auto;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        box-shadow: 0 12px 28px var(--overlay);
        z-index: 50;
      }
      .painel-head,
      .painel-foot {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.85rem 1rem;
      }
      .painel-head {
        border-bottom: 1px solid var(--border);
      }
      .painel-foot {
        border-top: 1px solid var(--border);
      }
      .vazio {
        padding: 1.25rem 1rem;
        color: var(--text-muted);
        font-size: 0.875rem;
      }
      .itens {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .itens li {
        display: flex;
        align-items: flex-start;
        gap: 0.65rem;
        padding: 0.75rem 1rem;
        border-bottom: 1px solid var(--border);
      }
      .itens li.nao-lida {
        background: var(--bg);
      }
      .marcador {
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 999px;
        margin-top: 0.4rem;
        flex: none;
        background: var(--text-muted);
      }
      .tipo-aprovada,
      .tipo-estoque {
        background: var(--primary);
      }
      .tipo-doca {
        background: var(--blue);
      }
      .tipo-pendente {
        background: var(--amber);
      }
      .texto {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
        flex: 1;
        min-width: 0;
      }
      .texto strong {
        font-size: 0.875rem;
      }
      .texto span {
        font-size: 0.8125rem;
        color: var(--text-muted);
      }
      time {
        font-size: 0.75rem;
        color: var(--text-muted);
        flex: none;
      }
    `,
  ],
})
export class NotificacoesComponent {
  protected notificacoes = inject(NotificacoesService);
  protected aberto = signal(false);

  alternar() {
    if (this.aberto()) {
      this.fechar();
      return;
    }
    this.aberto.set(true);
  }

  /** Só marca como lidas ao fechar — assim o operador vê o que chegou. */
  fechar() {
    this.aberto.set(false);
    this.notificacoes.marcarTodasLidas();
  }

  hora(d: Date): string {
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
}
