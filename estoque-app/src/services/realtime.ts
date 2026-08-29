import { useEffect, useRef, useState } from 'react';

import { BASE_URL } from './api';

export type EventoNome =
  | 'conectado'
  | 'doca:status_changed'
  | 'dock:released'
  | 'street:occupancy_updated'
  | 'pallet:stored'
  | 'movimentacao:created'
  | 'movimentacao:updated'
  | 'movimentacao:removed'
  | 'movimentacao:conferida'
  | 'movimentacao:autorizada'
  | 'movimentacao:enderecada'
  | (string & {});

export interface EventoSse {
  nome: EventoNome;
  payload: unknown;
}

type Ouvinte = (evento: EventoSse) => void;

/**
 * Cliente SSE mínimo. O React Native não traz EventSource, então lemos o
 * corpo da resposta em pedaços pelo XMLHttpRequest e cortamos por "\n\n".
 * No Expo Web usamos o EventSource nativo.
 */
function assinar(ouvinte: Ouvinte, aoMudarConexao: (ok: boolean) => void): () => void {
  const url = `${BASE_URL}/eventos/stream`;

  if (typeof EventSource !== 'undefined') {
    const source = new EventSource(url);
    source.onopen = () => aoMudarConexao(true);
    source.onerror = () => aoMudarConexao(false);
    // O back-end sempre nomeia os eventos, então assinamos um a um.
    for (const nome of NOMES) {
      source.addEventListener(nome, (ev) => {
        aoMudarConexao(true);
        ouvinte({ nome, payload: parse((ev as MessageEvent).data) });
      });
    }
    return () => source.close();
  }

  let encerrado = false;
  let xhr: XMLHttpRequest | null = null;
  let reconectar: ReturnType<typeof setTimeout> | undefined;

  const abrir = () => {
    if (encerrado) return;
    let lido = 0;
    let buffer = '';

    xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.setRequestHeader('Accept', 'text/event-stream');
    xhr.setRequestHeader('Cache-Control', 'no-cache');

    xhr.onreadystatechange = () => {
      if (!xhr) return;
      if (xhr.readyState === 3 || xhr.readyState === 4) {
        aoMudarConexao(xhr.readyState === 3);
        const novo = xhr.responseText.substring(lido);
        lido = xhr.responseText.length;
        buffer += novo;

        let corte = buffer.indexOf('\n\n');
        while (corte !== -1) {
          processarBloco(buffer.slice(0, corte), ouvinte);
          buffer = buffer.slice(corte + 2);
          corte = buffer.indexOf('\n\n');
        }
      }
      if (xhr.readyState === 4 && !encerrado) {
        aoMudarConexao(false);
        reconectar = setTimeout(abrir, 3000);
      }
    };

    xhr.onerror = () => {
      aoMudarConexao(false);
      if (!encerrado) reconectar = setTimeout(abrir, 3000);
    };

    xhr.send();
  };

  abrir();

  return () => {
    encerrado = true;
    clearTimeout(reconectar);
    xhr?.abort();
  };
}

const NOMES: EventoNome[] = [
  'conectado',
  'doca:status_changed',
  'dock:released',
  'street:occupancy_updated',
  'pallet:stored',
  'movimentacao:created',
  'movimentacao:updated',
  'movimentacao:removed',
  'movimentacao:conferida',
  'movimentacao:autorizada',
  'movimentacao:enderecada',
];

function processarBloco(bloco: string, ouvinte: Ouvinte) {
  let nome: EventoNome = 'message';
  const dados: string[] = [];

  for (const linha of bloco.split('\n')) {
    if (linha.startsWith('event:')) nome = linha.slice(6).trim();
    else if (linha.startsWith('data:')) dados.push(linha.slice(5).trim());
  }

  if (dados.length > 0) ouvinte({ nome, payload: parse(dados.join('\n')) });
}

function parse(bruto: string): unknown {
  try {
    return JSON.parse(bruto);
  } catch {
    return bruto;
  }
}

/**
 * Assina o canal de eventos e dispara `aoEvento` a cada notificação do back-end.
 * Use para recarregar a tela assim que a Web (ou outro coletor) mexer nos dados.
 */
export function useRealtime(aoEvento: (evento: EventoSse) => void) {
  const [conectado, setConectado] = useState(false);
  const callbackRef = useRef(aoEvento);
  callbackRef.current = aoEvento;

  useEffect(() => {
    const cancelar = assinar((evento) => callbackRef.current(evento), setConectado);
    return cancelar;
  }, []);

  return conectado;
}
