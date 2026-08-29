export interface Rua {
  id: number;
  codigo: string;
  categoria: string;
}

export interface Posicao {
  id: number;
  numero: number;
  ocupada: boolean;
  ruaId: number;
}

export interface Doca {
  id: number;
  numero: number;
  expedicao: boolean;
  ocupada: boolean;
}

export interface Produto {
  id: number;
  nome: string;
  unidade: string;
}

export interface Movimentacao {
  id: number;
  saida: boolean;
  dataHora: string;
  /** Quantidade declarada na nota. */
  quantidade: number;
  /** Quantidade contada no coletor (null enquanto não conferida). */
  quantidadeConferida: number | null;
  conferida: boolean;
  placa: string | null;
  motorista: string | null;
  transportadora: string | null;
  nota: string | null;
  autorizada: boolean;
  liberada: boolean;
  produtoId: number;
  posicaoId: number | null;
  docaId: number | null;
}

export interface Estoque {
  id: number;
  quantidade: number;
  produtoId: number;
  posicaoId: number;
}
