import { Component, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { Doca, Movimentacao, Posicao, Produto, Rua } from '../../core/models';
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

  movimentacoes = signal<Movimentacao[]>([]);
  produtos = signal<Produto[]>([]);
  posicoes = signal<Posicao[]>([]);
  ruas = signal<Rua[]>([]);
  docas = signal<Doca[]>([]);

  searchTerm = signal('');
  showForm = signal(false);

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
    if (!m.saida) return 'Entrada registrada';
    return m.liberada ? 'Liberada' : m.autorizada ? 'Autorizada' : 'Aguardando liberação';
  }

  onNova(payload: Partial<Movimentacao>) {
    this.api.salvarMovimentacao(payload).subscribe(() => {
      this.showForm.set(false);
      this.refresh();
    });
  }

  liberar(m: Movimentacao) {
    this.api.autorizarSaida(m.id).subscribe(() => this.refresh());
  }
}
