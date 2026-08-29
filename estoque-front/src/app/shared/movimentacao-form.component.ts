import { Component, computed, input, output, signal } from '@angular/core';
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
        <input id="quantidade" name="quantidade" type="number" min="1" step="1" [(ngModel)]="quantidade" required />
      </div>

      @if (!fixedDocaId()) {
        <div class="field">
          <label for="doca">Doca (opcional)</label>
          <select id="doca" name="doca" [(ngModel)]="docaId">
            <option [ngValue]="null">Nenhuma</option>
            @for (d of docas(); track d.id) {
              <option [ngValue]="d.id">Doca {{ d.numero }}</option>
            }
          </select>
        </div>
      }

      <div class="field">
        <label for="posicao">Posição (opcional)</label>
        <select id="posicao" name="posicao" [(ngModel)]="posicaoId">
          <option [ngValue]="null">Nenhuma</option>
          @for (p of posicoes(); track p.id) {
            <option [ngValue]="p.id">{{ ruaCodigo(p.ruaId) }} · pos. {{ p.numero }} ({{ p.ocupada ? 'ocupada' : 'livre' }})</option>
          }
        </select>
      </div>

      <div class="field-row">
        <div class="field">
          <label for="placa">Placa</label>
          <input id="placa" name="placa" type="text" [(ngModel)]="placa" />
        </div>
        <div class="field">
          <label for="nota">Nota</label>
          <input id="nota" name="nota" type="text" [(ngModel)]="nota" />
        </div>
      </div>

      <div class="field-row">
        <div class="field">
          <label for="motorista">Motorista</label>
          <input id="motorista" name="motorista" type="text" [(ngModel)]="motorista" />
        </div>
        <div class="field">
          <label for="transportadora">Transportadora</label>
          <input id="transportadora" name="transportadora" type="text" [(ngModel)]="transportadora" />
        </div>
      </div>

      <button type="submit" class="btn btn-primary" [disabled]="!canSubmit()">Confirmar</button>
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
        min-height: 2.5rem;
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

  canSubmit = computed(() => !!this.produtoId() && !!this.quantidade());

  constructor() {
    const fixed = this.fixedSaida();
    if (fixed !== null) this.saida.set(fixed);
  }

  ruaCodigo(ruaId: number): string {
    return this.ruas().find((r) => r.id === ruaId)?.codigo ?? '?';
  }

  onSubmit() {
    if (!this.canSubmit()) return;
    this.submitted.emit({
      saida: this.fixedSaida() ?? this.saida(),
      quantidade: this.quantidade()!,
      produtoId: this.produtoId()!,
      docaId: this.fixedDocaId() ?? this.docaId(),
      posicaoId: this.posicaoId(),
      placa: this.placa() || null,
      motorista: this.motorista() || null,
      transportadora: this.transportadora() || null,
      nota: this.nota() || null,
    });
  }
}
