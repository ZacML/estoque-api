import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Produto } from '../../core/models';
import { IconComponent } from '../../shared/icon.component';
import { ModalComponent } from '../../shared/modal.component';

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [FormsModule, IconComponent, ModalComponent],
  templateUrl: './produtos.component.html',
  styleUrl: './produtos.component.scss',
})
export class ProdutosComponent {
  private api = inject(ApiService);

  produtos = signal<Produto[]>([]);
  searchTerm = signal('');

  editando = signal<Produto | null | undefined>(undefined);
  nome = signal('');
  unidade = signal('');
  erro = signal('');

  podeSalvar = computed(() => !!this.nome().trim() && !!this.unidade().trim());

  produtosFiltrados = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    return this.produtos().filter((p) => !term || p.nome.toLowerCase().includes(term));
  });

  constructor() {
    this.refresh();
  }

  refresh() {
    this.api.listarProdutos().subscribe((data) => this.produtos.set(data));
  }

  novo() {
    this.nome.set('');
    this.unidade.set('');
    this.erro.set('');
    this.editando.set(null);
  }

  editar(p: Produto) {
    this.nome.set(p.nome);
    this.unidade.set(p.unidade);
    this.erro.set('');
    this.editando.set(p);
  }

  salvar() {
    if (!this.podeSalvar()) return;
    const payload = { nome: this.nome().trim(), unidade: this.unidade().trim() };
    const atual = this.editando();
    const req = atual ? this.api.atualizarProduto(atual.id, payload) : this.api.salvarProduto(payload);
    req.subscribe({
      next: () => {
        this.editando.set(undefined);
        this.refresh();
      },
      error: (e) => this.erro.set(e?.error?.mensagem ?? 'Não foi possível salvar o produto.'),
    });
  }

  excluir(p: Produto) {
    if (!confirm(`Remover o produto "${p.nome}"?`)) return;
    this.api.deletarProduto(p.id).subscribe({
      next: () => this.refresh(),
      error: () => alert('Produto em uso em movimentações ou estoque — não é possível remover.'),
    });
  }
}
