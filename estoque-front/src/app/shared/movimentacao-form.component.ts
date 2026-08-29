import { Component, computed, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Doca, Movimentacao, Posicao, Produto, Rua } from '../core/models';

@Component({
  selector: 'app-movimentacao-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <form class="form" (ngSubmit)="onSubmit()">
      @if (fixedSaida() === null) {
        <div class="field">
          <label>Tipo</label>
          <div class="radio-row">
            <label><input type="radio" name="tipo" [checked]="saida() === false" (change)="saida.set(false)" /> Entrada</label>
            <label><input type="radio" name="tipo" [checked]="saida() === true" (change)="saida.set(true)" /> Saída</label>
          </div>
        </div>
      }

      <div class="field">
        <label for="produto">Produto</label>
        <select id="produto" name="produto" [(ngModel)]="produtoId" required>
          <option [ngValue]="null" disabled>Selecione um produto</option>
          @for (p of produtos(); track p.id) {
            <option [ngValue]="p.id">{{ p.nome }}</option>
          }
        </select>
      </div>

      <div class="field">
        <label for="quantidade">Quantidade</label>
        <input id="quantidade" name="quantidade" type="number" min="0.01" step="0.01" [(ngModel)]="quantidade" required />
        @if (quantidade() !== null && (quantidade() ?? 1) <= 0) {
          <small class="erro">Informe uma quantidade maior que zero.</small>
        }
      </div>

      @if (!fixedDocaId()) {
        <div class="field">
          <label for="doca">Doca (opcional)</label>
          <select id="doca" name="doca" [(ngModel)]="docaId">
            <option [ngValue]="null">Nenhuma</option>
            @for (d of docas(); track d.id) {
              <option [ngValue]="d.id">Doca {{ d.numero }} · {{ d.expedicao ? 'expedição' : 'recebimento' }}</option>
            }
          </select>
        </div>
      }

      <!-- Sem posições carregadas o campo só confundiria: o endereçamento é feito no coletor. -->
      @if (posicoes().length > 0) {
        <div class="field">
          <label for="posicao">Posição (opcional)</label>
          <select id="posicao" name="posicao" [(ngModel)]="posicaoId">
            <option [ngValue]="null">Nenhuma</option>
            @for (p of posicoes(); track p.id) {
              <option [ngValue]="p.id">
                {{ ruaCodigo(p.ruaId) }} · pos. {{ p.numero }} ({{ p.ocupada ? 'ocupada' : 'livre' }})
              </option>
            }
          </select>
        </div>
      }

      <div class="field-row">
        <div class="field">
          <label for="placa">Placa</label>
          <input
            id="placa"
            name="placa"
            type="text"
            maxlength="10"
            placeholder="ABC1D23"
            [ngModel]="placa()"
            (ngModelChange)="placa.set($any($event).toUpperCase())"
          />
        </div>
        <div class="field">
          <label for="nota">Nota</label>
          <input id="nota" name="nota" type="text" maxlength="20" [(ngModel)]="nota" />
        </div>
      </div>

      <div class="field-row">
        <div class="field">
          <label for="motorista">Motorista</label>
          <input id="motorista" name="motorista" type="text" maxlength="80" [(ngModel)]="motorista" />
        </div>
        <div class="field">
          <label for="transportadora">Transportadora</label>
          <input id="transportadora" name="transportadora" type="text" maxlength="80" [(ngModel)]="transportadora" />
        </div>
      </div>

      <button type="submit" class="btn btn-primary" [disabled]="!canSubmit()">
        {{ inicial() ? 'Salvar alterações' : 'Confirmar' }}
      </button>
    </form>
  `,
  styles: [
    `
      .form {
        display: flex;
        flex-direction: column;
        gap: 0.9rem;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        flex: 1;
        min-width: 0;
      }
      .field-row {
        display: flex;
        gap: 0.75rem;
      }
      label {
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--text-muted);
      }
      input,
      select {
        border: 1px solid var(--border);
        border-radius: 0.5rem;
        padding: 0.6rem 0.7rem;
        background: var(--surface);
        color: var(--text);
        min-height: 2.5rem;
        width: 100%;
      }
      .erro {
        color: var(--red);
        font-size: 0.75rem;
      }
      .radio-row {
        display: flex;
        gap: 1.25rem;
      }
      .radio-row label {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-weight: 500;
        color: var(--text);
      }
      .btn {
        margin-top: 0.25rem;
      }
    `,
  ],
})
export class MovimentacaoFormComponent {
  produtos = input.required<Produto[]>();
  posicoes = input<Posicao[]>([]);
  docas = input<Doca[]>([]);
  ruas = input<Rua[]>([]);
  fixedDocaId = input<number | null>(null);
  fixedSaida = input<boolean | null>(null);
  /** Preenche o formulário para edição de uma movimentação existente. */
  inicial = input<Movimentacao | null>(null);

  submitted = output<Partial<Movimentacao>>();

  saida = signal<boolean>(false);
  produtoId = signal<number | null>(null);
  quantidade = signal<number | null>(null);
  docaId = signal<number | null>(null);
  posicaoId = signal<number | null>(null);
  placa = signal('');
  motorista = signal('');
  transportadora = signal('');
  nota = signal('');

  canSubmit = computed(() => !!this.produtoId() && !!this.quantidade() && this.quantidade()! > 0);

  constructor() {
    // Inputs só chegam depois da construção — por isso a semente roda num effect.
    effect(() => {
      const fixed = this.fixedSaida();
      if (fixed !== null) this.saida.set(fixed);
    });

    effect(() => {
      const m = this.inicial();
      if (!m) return;
      this.saida.set(m.saida);
      this.produtoId.set(m.produtoId);
      this.quantidade.set(m.quantidade);
      this.docaId.set(m.docaId);
      this.posicaoId.set(m.posicaoId);
      this.placa.set(m.placa ?? '');
      this.motorista.set(m.motorista ?? '');
      this.transportadora.set(m.transportadora ?? '');
      this.nota.set(m.nota ?? '');
    });
  }

  ruaCodigo(ruaId: number): string {
    return this.ruas().find((r) => r.id === ruaId)?.codigo ?? '?';
  }

  onSubmit() {
    if (!this.canSubmit()) return;
    const anterior = this.inicial();
    this.submitted.emit({
      saida: this.fixedSaida() ?? this.saida(),
      quantidade: this.quantidade()!,
      produtoId: this.produtoId()!,
      docaId: this.fixedDocaId() ?? this.docaId(),
      posicaoId: this.posicaoId(),
      placa: this.placa().trim() || null,
      motorista: this.motorista().trim() || null,
      transportadora: this.transportadora().trim() || null,
      nota: this.nota().trim() || null,
      // Numa edição não podemos zerar o que já foi conferido/autorizado/liberado.
      quantidadeConferida: anterior?.quantidadeConferida ?? null,
      conferida: anterior?.conferida ?? false,
      autorizada: anterior?.autorizada ?? false,
      liberada: anterior?.liberada ?? false,
      dataHora: anterior?.dataHora,
    });
  }
}
