import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Aviso, Button, Card, CodeBadge, Linha, Pill, Progresso } from '@/components/golinho-ui';
import { Ui } from '@/constants/theme';
import { useGolinho } from '@/hooks/use-golinho';
import { api, type Doca, type Movimentacao, type Produto } from '@/services/api';
import { useRealtime } from '@/services/realtime';

export default function ConferenciaScreen() {
  const c = useGolinho();
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const docaId = Number(id);

  const [doca, setDoca] = useState<Doca | null>(null);
  const [itens, setItens] = useState<Movimentacao[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const [emConferencia, setEmConferencia] = useState<Movimentacao | null>(null);
  const [quantidadeDigitada, setQuantidadeDigitada] = useState('');

  const carregar = useCallback(async () => {
    try {
      const [docas, movs, prods] = await Promise.all([
        api.listarDocas(),
        api.listarMovimentacoesPorDoca(docaId),
        api.listarProdutos(),
      ]);
      setDoca(docas.find((d) => d.id === docaId) ?? null);
      setItens(movs.filter((m) => !m.liberada).sort((a, b) => a.id - b.id));
      setProdutos(prods);
      setErro('');
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao carregar a carga da doca.');
    } finally {
      setCarregando(false);
    }
  }, [docaId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useRealtime(carregar);

  useEffect(() => {
    if (doca) navigation.setOptions({ title: `Doca ${doca.numero} · conferência` });
  }, [doca, navigation]);

  const produtoPorId = useMemo(() => new Map(produtos.map((p) => [p.id, p])), [produtos]);

  const conferidos = itens.filter((m) => m.conferida).length;
  const pct = itens.length === 0 ? 0 : Math.round((conferidos / itens.length) * 100);
  const tudoConferido = itens.length > 0 && conferidos === itens.length;

  function abrirConferencia(item: Movimentacao) {
    setEmConferencia(item);
    setQuantidadeDigitada(String(item.quantidadeConferida ?? item.quantidade));
    setErro('');
  }

  async function confirmarQuantidade() {
    if (!emConferencia) return;
    const valor = Number(quantidadeDigitada.replace(',', '.'));
    if (!Number.isFinite(valor) || valor < 0) {
      setErro('Informe uma quantidade válida.');
      return;
    }
    setSalvando(true);
    try {
      await api.conferirItem(emConferencia.id, valor);
      setEmConferencia(null);
      await carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível gravar a conferência.');
    } finally {
      setSalvando(false);
    }
  }

  /** Finaliza a nota e libera a doca — a Web reage na mesma hora. */
  async function validarEFinalizar() {
    if (itens.length === 0) return;
    setSalvando(true);
    try {
      for (const item of itens) {
        await api.validarLiberarDoca(item.id);
      }
      router.back();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível finalizar a conferência.');
      setSalvando(false);
    }
  }

  function divergencia(m: Movimentacao): number | null {
    if (m.quantidadeConferida === null) return null;
    const diff = m.quantidadeConferida - m.quantidade;
    return diff === 0 ? null : diff;
  }

  return (
    <SafeAreaView edges={['bottom']} style={[styles.tela, { backgroundColor: c.bg }]}>
      <ScrollView
        contentContainerStyle={styles.conteudo}
        refreshControl={<RefreshControl refreshing={carregando} onRefresh={carregar} tintColor={c.muted} />}>
        {erro ? <Aviso texto={erro} /> : null}

        <Card>
          <View style={styles.resumoTopo}>
            <Text style={[styles.titulo, { color: c.text }]}>
              {itens.length > 0 ? `Nota ${itens[0].nota ?? '—'}` : 'Sem carga'}
            </Text>
            {itens[0]?.placa ? <CodeBadge>{itens[0].placa}</CodeBadge> : null}
          </View>
          <Linha rotulo="Motorista" valor={itens[0]?.motorista ?? '—'} />
          <Linha rotulo="Transportadora" valor={itens[0]?.transportadora ?? '—'} />
          <Linha rotulo="Itens conferidos" valor={`${conferidos} de ${itens.length}`} />
          <Progresso pct={pct} tom={tudoConferido ? 'green' : 'amber'} />
        </Card>

        <Text style={[styles.secao, { color: c.muted }]}>ITENS DA NOTA — TOQUE PARA CONFERIR</Text>

        {itens.length === 0 && !carregando ? (
          <Text style={{ color: c.muted, fontSize: Ui.font.sm }}>Nenhum item aguardando conferência nesta doca.</Text>
        ) : null}

        {itens.map((item) => {
          const produto = produtoPorId.get(item.produtoId);
          const diff = divergencia(item);

          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={`Conferir ${produto?.nome ?? 'item'}`}
              onPress={() => abrirConferencia(item)}
              style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
              <Card>
                <View style={styles.itemTopo}>
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemNome, { color: c.text }]}>{produto?.nome ?? 'Produto'}</Text>
                    <Text style={{ color: c.muted, fontSize: Ui.font.sm }}>
                      Nota: {item.quantidade} {produto?.unidade ?? ''}
                      {item.quantidadeConferida !== null
                        ? ` · contado: ${item.quantidadeConferida} ${produto?.unidade ?? ''}`
                        : ''}
                    </Text>
                  </View>
                  {!item.conferida ? (
                    <Pill tom="gray">A conferir</Pill>
                  ) : diff === null ? (
                    <Pill tom="green">Conferido</Pill>
                  ) : (
                    <Pill tom={diff < 0 ? 'red' : 'amber'}>
                      {diff > 0 ? `Sobra +${diff}` : `Falta ${diff}`}
                    </Pill>
                  )}
                </View>

                {item.conferida ? (
                  <View style={styles.itemAcoes}>
                    {item.posicaoId ? (
                      <Pill tom="blue">Endereçado</Pill>
                    ) : (
                      <Button
                        label="Endereçar palete"
                        variante="ghost"
                        onPress={() => router.push({ pathname: '/enderecar/[id]', params: { id: String(item.id) } })}
                      />
                    )}
                  </View>
                ) : null}
              </Card>
            </Pressable>
          );
        })}

        <View style={styles.finalizar}>
          <Button
            label="Validar & Finalizar Conferência"
            onPress={validarEFinalizar}
            disabled={!tudoConferido}
            carregando={salvando && !emConferencia}
          />
          {!tudoConferido && itens.length > 0 ? (
            <Text style={{ color: c.muted, fontSize: Ui.font.xs, textAlign: 'center' }}>
              Confira todos os itens para liberar a doca.
            </Text>
          ) : null}
        </View>
      </ScrollView>

      <Modal visible={!!emConferencia} transparent animationType="slide" onRequestClose={() => setEmConferencia(null)}>
        <View style={styles.overlay}>
          <View style={[styles.painel, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Text style={[styles.painelTitulo, { color: c.text }]}>
              {produtoPorId.get(emConferencia?.produtoId ?? -1)?.nome ?? 'Item'}
            </Text>
            <Text style={{ color: c.muted, fontSize: Ui.font.sm }}>
              A nota declara {emConferencia?.quantidade} {produtoPorId.get(emConferencia?.produtoId ?? -1)?.unidade ?? ''}.
              Informe o que foi contado.
            </Text>

            <TextInput
              value={quantidadeDigitada}
              onChangeText={setQuantidadeDigitada}
              keyboardType="decimal-pad"
              autoFocus
              accessibilityLabel="Quantidade recebida"
              style={[styles.input, { borderColor: c.border, color: c.text, backgroundColor: c.bg }]}
            />

            {emConferencia && Number(quantidadeDigitada.replace(',', '.')) !== emConferencia.quantidade ? (
              <Aviso
                tom={Number(quantidadeDigitada.replace(',', '.')) < emConferencia.quantidade ? 'red' : 'amber'}
                texto={
                  Number(quantidadeDigitada.replace(',', '.')) < emConferencia.quantidade
                    ? 'Divergência: falta em relação à nota.'
                    : 'Divergência: sobra em relação à nota.'
                }
              />
            ) : null}

            <View style={styles.painelAcoes}>
              <Button label="Cancelar" variante="ghost" onPress={() => setEmConferencia(null)} />
              <Button label="Confirmar" onPress={confirmarQuantidade} carregando={salvando} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1 },
  conteudo: { padding: 16, paddingBottom: 32, gap: 12 },
  titulo: { fontSize: Ui.font.lg, fontWeight: '700' },
  resumoTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  secao: { fontSize: Ui.font.xs, fontWeight: '700', letterSpacing: 0.6, marginTop: 8 },
  itemTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  itemInfo: { flex: 1, minWidth: 0, gap: 2 },
  itemNome: { fontSize: Ui.font.md, fontWeight: '700' },
  itemAcoes: { flexDirection: 'row', justifyContent: 'flex-end' },
  finalizar: { gap: 8, marginTop: 12 },
  overlay: { flex: 1, backgroundColor: 'rgba(2, 6, 23, 0.6)', justifyContent: 'flex-end' },
  painel: { borderTopWidth: 1, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, gap: 14 },
  painelTitulo: { fontSize: Ui.font.lg, fontWeight: '700' },
  input: {
    borderWidth: 1,
    borderRadius: Ui.radius,
    minHeight: Ui.touch,
    paddingHorizontal: 16,
    fontSize: Ui.font.xl,
    fontWeight: '700',
    textAlign: 'center',
  },
  painelAcoes: { flexDirection: 'row', gap: 12, justifyContent: 'flex-end' },
});
