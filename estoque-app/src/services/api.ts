import Constants from 'expo-constants';

/**
 * O back-end roda na mesma máquina do Metro. No emulador/dispositivo físico
 * `localhost` é o próprio aparelho, então usamos o IP que o Expo já conhece.
 * Para apontar para outro host, defina EXPO_PUBLIC_API_URL.
 */
function resolverBaseUrl(): string {
  const explicito = process.env.EXPO_PUBLIC_API_URL;
  if (explicito) return explicito.replace(/\/$/, '');

  const hostUri: string | undefined =
    Constants.expoConfig?.hostUri ?? (Constants as { expoGoConfig?: { debuggerHost?: string } }).expoGoConfig?.debuggerHost;
  const host = hostUri?.split(':')[0];
  return `http://${host ?? 'localhost'}:8080`;
}

export const BASE_URL = resolverBaseUrl();

// ------------------------------------------------------------------ modelos

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

export interface Movimentacao {
  id: number;
  saida: boolean;
  dataHora: string;
  quantidade: number;
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

// -------------------------------------------------------------------- infra

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let resposta: Response;
  try {
    resposta = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    });
  } catch {
    throw new ApiError(`Sem conexão com o servidor (${BASE_URL}).`, 0);
  }

  if (!resposta.ok) {
    const corpo = await resposta.text();
    let mensagem = `Erro ${resposta.status}`;
    try {
      mensagem = JSON.parse(corpo)?.mensagem ?? mensagem;
    } catch {
      // resposta sem corpo JSON
    }
    throw new ApiError(mensagem, resposta.status);
  }

  if (resposta.status === 204) return undefined as T;
  return (await resposta.json()) as T;
}

// ------------------------------------------------------------------- rotas

export const api = {
  listarDocas: () => request<Doca[]>('/docas'),
  listarProdutos: () => request<Produto[]>('/produtos'),
  listarRuas: () => request<Rua[]>('/ruas'),
  listarPosicoes: () => request<Posicao[]>('/posicoes'),
  listarPosicoesPorRua: (ruaId: number) => request<Posicao[]>(`/posicoes/rua/${ruaId}`),

  listarMovimentacoes: () => request<Movimentacao[]>('/movimentacoes'),
  listarMovimentacoesPorDoca: (docaId: number) => request<Movimentacao[]>(`/movimentacoes/doca/${docaId}`),
  buscarMovimentacao: (id: number) => request<Movimentacao>(`/movimentacoes/${id}`),

  /** Conferência quantitativa manual do item da nota. */
  conferirItem: (id: number, quantidadeConferida: number) =>
    request<Movimentacao>(`/movimentacoes/${id}/conferir`, {
      method: 'PUT',
      body: JSON.stringify({ quantidadeConferida }),
    }),

  /** Finaliza a nota e devolve a doca para "Livre" na Web. */
  validarLiberarDoca: (id: number) =>
    request<Movimentacao>(`/movimentacoes/${id}/validar-liberar-doca`, { method: 'PUT' }),

  /** Vincula o palete à posição escolhida e ocupa o endereço no mapa. */
  enderecarPalete: (id: number, posicaoId: number, quantidade?: number) =>
    request<Movimentacao>(`/movimentacoes/${id}/enderecar`, {
      method: 'POST',
      body: JSON.stringify({ posicaoId, quantidade: quantidade ?? null }),
    }),
};
