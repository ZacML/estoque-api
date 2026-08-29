import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Aviso, Card, CodeBadge, Pill, Progresso } from '@/components/golinho-ui';
import { Ui } from '@/constants/theme';
import { useGolinho } from '@/hooks/use-golinho';
import { api, type Doca, type Movimentacao, type Produto } from '@/services/api';
import { useRealtime } from '@/services/realtime';

interface CardDoca {
  doca: Doca;
  carga: Movimentacao[];
  atual: Movimentacao | null;
  conferidos: number;
  pct: number;
}

export default function DocasScreen() {
  const c = useGolinho();
  const router = useRouter();

  const [docas, setDocas] = useState<Doca[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    try {
      const [d, m, p] = await Promise.all([api.listarDocas(), api.listarMovimentacoes(), api.listarProdutos()]);
      setDocas(d.sort((a, b) => a.numero - b.numero));
      setMovimentacoes(m);
      setProdutos(p);
      setErro('');
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao carregar as docas.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Mudou alguma coisa na Web ou em outro coletor? A lista se redesenha.
  const conectado = useRealtime(carregar);

  const produtoPorId = useMemo(() => new Map(produtos.map((p) => [p.id, p])), [produtos]);

  const cards: CardDoca[] = useMemo(
    () =>
      docas.map((doca) => {
        const carga = movimentacoes
          .filter((m) => m.docaId === doca.id && !m.liberada)
          .sort((a, b) => +new Date(b.dataHora) - +new Date(a.dataHora));
        const conferidos = carga.filter((m) => m.conferida).length;
        return {
          doca,
          carga,
          atual: carga[0] ?? null,
          conferidos,
          pct: carga.length === 0 ? 0 : Math.round((conferidos / carga.length) * 100),
        };
      }),
    [docas, movimentacoes],
  );

  const livres = cards.filter((x) => !x.doca.ocupada).length;

  return (
    <SafeAreaView edges={['bottom']} style={[styles.tela, { backgroundColor: c.bg }]}>
      <FlatList
        data={cards}
        keyExtractor={(item) => String(item.doca.id)}
        contentContainerStyle={styles.lista}
        refreshControl={<RefreshControl refreshing={carregando} onRefresh={carregar} tintColor={c.muted} />}
        ListHeaderComponent={
          <View style={styles.cabecalho}>
            <View>
              <Text style={[styles.titulo, { color: c.text }]}>Docas</Text>
              <Text style={[styles.subtitulo, { color: c.muted }]}>
                {livres} livre(s) de {cards.length} · toque na doca para conferir a nota
              </Text>
            </View>
            <Pill tom={conectado ? 'green' : 'gray'}>{conectado ? 'ao vivo' : 'offline'}</Pill>
          </View>
        }
        ListEmptyComponent={
          carregando ? null : (
            <Text style={[styles.vazio, { color: c.muted }]}>Nenhuma doca cadastrada no sistema.</Text>
          )
        }
        renderItem={({ item }) => {
          const produto = item.atual ? produtoPorId.get(item.atual.produtoId) : undefined;
          const aguardando = item.doca.ocupada && item.pct < 100;

          return (
            <Pressable
              accessibilityRole="button"
              disabled={item.carga.length === 0}
              onPress={() => router.push({ pathname: '/doca/[id]', params: { id: String(item.doca.id) } })}
              style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
              <Card>
                <View style={styles.docaTopo}>
                  <View style={[styles.numero, { backgroundColor: item.doca.ocupada ? c.amberSoft : c.primarySoft }]}>
                    <Text style={[styles.numeroTexto, { color: item.doca.ocupada ? c.amber : c.primaryDark }]}>
                      {item.doca.numero}
                    </Text>
                  </View>
                  <View style={styles.docaInfo}>
                    <Text style={[styles.docaNome, { color: c.text }]}>Doca {item.doca.numero}</Text>
                    <Text style={{ color: c.muted, fontSize: Ui.font.sm }}>
                      {item.doca.expedicao ? 'Expedição' : 'Recebimento'}
                    </Text>
                  </View>
                  {!item.doca.ocupada ? (
                    <Pill tom="green">Livre</Pill>
                  ) : aguardando ? (
                    <Pill tom="blue">Aguardando conferência</Pill>
                  ) : (
                    <Pill tom="amber">Pronta para liberar</Pill>
                  )}
                </View>

                {item.atual ? (
                  <>
                    <View style={styles.notaLinha}>
                      <CodeBadge>NF {item.atual.nota ?? '—'}</CodeBadge>
                      <CodeBadge>{item.atual.placa ?? 'SEM PLACA'}</CodeBadge>
                    </View>
                    <Text style={{ color: c.muted, fontSize: Ui.font.sm }}>
                      {produto?.nome ?? 'Produto'} · {item.atual.quantidade} {produto?.unidade ?? ''}
                      {item.atual.transportadora ? ` · ${item.atual.transportadora}` : ''}
                    </Text>
                    <View style={styles.progressoBloco}>
                      <View style={styles.progressoTopo}>
                        <Text style={{ color: c.muted, fontSize: Ui.font.xs }}>Conferência física</Text>
                        <Text style={{ color: c.text, fontSize: Ui.font.xs, fontWeight: '700' }}>
                          {item.conferidos}/{item.carga.length} itens
                        </Text>
                      </View>
                      <Progresso pct={item.pct} tom={item.pct === 100 ? 'green' : 'amber'} />
                    </View>
                  </>
                ) : (
                  <Text style={{ color: c.muted, fontSize: Ui.font.sm }}>Nenhuma carga aguardando nesta doca.</Text>
                )}
              </Card>
            </Pressable>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />

      {erro ? (
        <View style={styles.rodape}>
          <Aviso texto={erro} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1 },
  lista: { padding: 16, paddingBottom: 32 },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  titulo: { fontSize: Ui.font.xl, fontWeight: '700' },
  subtitulo: { fontSize: Ui.font.sm, marginTop: 2 },
  vazio: { fontSize: Ui.font.sm, paddingVertical: 24, textAlign: 'center' },
  docaTopo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  numero: { width: 44, height: 44, borderRadius: Ui.radiusSm, alignItems: 'center', justifyContent: 'center' },
  numeroTexto: { fontSize: Ui.font.lg, fontWeight: '800' },
  docaInfo: { flex: 1, minWidth: 0 },
  docaNome: { fontSize: Ui.font.md, fontWeight: '700' },
  notaLinha: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  progressoBloco: { gap: 6 },
  progressoTopo: { flexDirection: 'row', justifyContent: 'space-between' },
  rodape: { padding: 16 },
});
