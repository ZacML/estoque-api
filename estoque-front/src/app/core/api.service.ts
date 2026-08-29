import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Doca, Estoque, Movimentacao, Posicao, Produto, Rua } from './models';

const BASE = 'http://localhost:8080';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  // Ruas
  listarRuas() {
    return this.http.get<Rua[]>(`${BASE}/ruas`);
  }

  // Posições
  listarPosicoes() {
    return this.http.get<Posicao[]>(`${BASE}/posicoes`);
  }
  listarPosicoesPorRua(ruaId: number) {
    return this.http.get<Posicao[]>(`${BASE}/posicoes/rua/${ruaId}`);
  }

  // Docas
  listarDocas() {
    return this.http.get<Doca[]>(`${BASE}/docas`);
  }
  atualizarDoca(id: number, doca: Doca) {
    return this.http.put<Doca>(`${BASE}/docas/${id}`, doca);
  }

  // Produtos
  listarProdutos() {
    return this.http.get<Produto[]>(`${BASE}/produtos`);
  }
  salvarProduto(produto: Partial<Produto>) {
    return this.http.post<Produto>(`${BASE}/produtos`, produto);
  }
  atualizarProduto(id: number, produto: Partial<Produto>) {
    return this.http.put<Produto>(`${BASE}/produtos/${id}`, produto);
  }
  deletarProduto(id: number) {
    return this.http.delete<void>(`${BASE}/produtos/${id}`);
  }

  // Estoque
  listarEstoques() {
    return this.http.get<Estoque[]>(`${BASE}/estoques`);
  }

  // Movimentações
  listarMovimentacoes() {
    return this.http.get<Movimentacao[]>(`${BASE}/movimentacoes`);
  }
  listarSaidasPendentes() {
    return this.http.get<Movimentacao[]>(`${BASE}/movimentacoes/pendentes`);
  }
  salvarMovimentacao(mov: Partial<Movimentacao>) {
    return this.http.post<Movimentacao>(`${BASE}/movimentacoes`, mov);
  }
  autorizarSaida(id: number) {
    return this.http.put<Movimentacao>(`${BASE}/movimentacoes/${id}/autorizar`, {});
  }
}
