import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Doca, Estoque, Movimentacao, Posicao, Produto, Rua } from './models';

export const BASE_URL = 'http://localhost:8080';

const BASE = BASE_URL;

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  // Ruas
  listarRuas() {
    return this.http.get<Rua[]>(`${BASE}/ruas`);
  }
  salvarRua(rua: Partial<Rua>) {
    return this.http.post<Rua>(`${BASE}/ruas`, rua);
  }
  atualizarRua(id: number, rua: Partial<Rua>) {
    return this.http.put<Rua>(`${BASE}/ruas/${id}`, rua);
  }
  deletarRua(id: number) {
    return this.http.delete<void>(`${BASE}/ruas/${id}`);
  }

  // Posições
  listarPosicoes() {
    return this.http.get<Posicao[]>(`${BASE}/posicoes`);
  }
  listarPosicoesPorRua(ruaId: number) {
    return this.http.get<Posicao[]>(`${BASE}/posicoes/rua/${ruaId}`);
  }
  atualizarPosicao(id: number, posicao: Partial<Posicao>) {
    return this.http.put<Posicao>(`${BASE}/posicoes/${id}`, posicao);
  }

  // Docas
  listarDocas() {
    return this.http.get<Doca[]>(`${BASE}/docas`);
  }
  listarDocasLivres() {
    return this.http.get<Doca[]>(`${BASE}/docas/livres`);
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
  listarEstoquePorPosicao(posicaoId: number) {
    return this.http.get<Estoque[]>(`${BASE}/estoques/posicao/${posicaoId}`);
  }
  salvarEstoque(estoque: Partial<Estoque>) {
    return this.http.post<Estoque>(`${BASE}/estoques`, estoque);
  }
  deletarEstoque(id: number) {
    return this.http.delete<void>(`${BASE}/estoques/${id}`);
  }

  // Movimentações
  listarMovimentacoes() {
    return this.http.get<Movimentacao[]>(`${BASE}/movimentacoes`);
  }
  listarMovimentacoesPorDoca(docaId: number) {
    return this.http.get<Movimentacao[]>(`${BASE}/movimentacoes/doca/${docaId}`);
  }
  listarSaidasPendentes() {
    return this.http.get<Movimentacao[]>(`${BASE}/movimentacoes/pendentes`);
  }
  salvarMovimentacao(mov: Partial<Movimentacao>) {
    return this.http.post<Movimentacao>(`${BASE}/movimentacoes`, mov);
  }
  atualizarMovimentacao(id: number, mov: Partial<Movimentacao>) {
    return this.http.put<Movimentacao>(`${BASE}/movimentacoes/${id}`, mov);
  }
  deletarMovimentacao(id: number) {
    return this.http.delete<void>(`${BASE}/movimentacoes/${id}`);
  }
  autorizarSaida(id: number) {
    return this.http.put<Movimentacao>(`${BASE}/movimentacoes/${id}/autorizar`, {});
  }
  conferirItem(id: number, quantidadeConferida: number) {
    return this.http.put<Movimentacao>(`${BASE}/movimentacoes/${id}/conferir`, { quantidadeConferida });
  }
  validarLiberarDoca(id: number) {
    return this.http.put<Movimentacao>(`${BASE}/movimentacoes/${id}/validar-liberar-doca`, {});
  }
  enderecarPalete(id: number, posicaoId: number, quantidade?: number) {
    return this.http.post<Movimentacao>(`${BASE}/movimentacoes/${id}/enderecar`, { posicaoId, quantidade });
  }
}
