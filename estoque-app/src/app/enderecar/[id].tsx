import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Aviso, Button, Card, CodeBadge, Linha, Pill, Progresso } from '@/components/golinho-ui';
import { Ui } from '@/constants/theme';
import { useGolinho } from '@/hooks/use-golinho';
import { api, type Movimentacao, type Posicao, type Produto, type Rua } from '@/services/api';
import { useRealtime } from '@/services/realtime';

export default function EnderecarScreen() {
  const c = useGolinho();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const movId = Number(id);

  const [mov, setMov] = useState<Movimentacao | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [ruas, setRuas] = useState<Rua[]>([]);
  const [posicoes, setPosicoes] = useState<Posicao[]>([]);
  const [ruaId, setRuaId] = useState<number | null>(null);
  const [posicaoId, setPosicaoId] = useState<number | null>(null);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const [m, prods, rs, ps] = await Promise.all([
        api.buscarMovimentacao(movId),
        api.listarProdutos(),
        api.listarRuas(),
        api.listarPosicoes(),
      ]);
      setMov(m);
      setProdutos(prods);
      setRuas(rs.sort((a, b) => a.codigo.localeCompare(b.codigo)));
      setPosicoes(ps);
      setErro('');
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao carregar o palete.');
    }
  }, [movId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Outro operador pode ocupar a posição enquanto esta tela está aberta.
  useRealtime(carregar);

  const produto = produtos.find((p) => p.id === mov?.produtoId);

  const ocupacaoDaRua = useCallback(
    (rua: Rua) => {
      const daRua = posicoes.filter((p) => p.ruaId === rua.id);
      if (daRua.length === 0) return { pct: 0, livres: 0, total: 0 };
      const ocupadas = daRua.filter((p) => p.ocupada).length;
      return { pct: Math.round((ocupadas / daRua.length) * 100), livres: daRua.length - ocupadas, total: daRua.length };
    },
    [posicoes],
  );

  const posicoesDaRua = useMemo(
    () => posicoes.filter((p) => p.ruaId === ruaId).sort((a, b) => a.numero - b.numero),
    [posicoes, ruaId],
  );

  const ruaSelecionada = ruas.find((r) => r.id === ruaId) ?? null;
  const posicaoSelecionada = posicoes.find((p) => p.id === posicaoId) ?? null;

  /** Como fica a ocupação da rua depois que este palete entrar. */
  const projecao = useMemo(() => {
    if (!ruaSelecionada || !posicaoSelecionada) return null;
    const daRua = posicoes.filter((p) => p.ruaId === ruaSelecionada.id);
    if (daRua.length === 0) return null;
    const antes = Math.round((daRua.filter((p) => p.ocupada).length / daRua.length) * 100);
    const depois = Math.round((daRua.filter((p) => p.ocupada || p.id === posicaoSelecionada.id).length / daRua.length) * 100);
    return { antes, depois };
  }, [posicoes, ruaSelecionada, posicaoSelecionada]);

  async function confirmar() {
    if (!mov || !posicaoId) return;
    setSalvando(true);
    try {
      await api.enderecarPalete(mov.id, posicaoId);
      router.back();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível endereçar o palete.');
      setSalvando(false);
    }
  }

  return (
    <SafeAreaView edges={['bottom']} style={[styles.tela, { backgroundColor: c.bg }]}>
      <ScrollView contentContainerStyle={styles.conteudo}>
        {erro ? <Aviso texto={erro} /> : null}

        <Card>
          <View style={styles.topo}>
            <Text style={[styles.titulo, { color: c.text }]}>{produto?.nome ?? 'Palete'}</Text>
            {mov?.nota ? <CodeBadge>NF {mov.nota}</CodeBadge> : null}
          </View>
          <Linha
            rotulo="Quantidade a guardar"
            valor={`${mov?.quantidadeConferida ?? mov?.quantidade ?? '—'} ${produto?.unidade ?? ''}`}
          />
          <Linha
            rotulo="Destino"
            valor={
              posicaoSelecionada && ruaSelecionada ? (
                <CodeBadge>
                  {ruaSelecionada.codigo}-P{String(posicaoSelecionada.numero).padStart(2, '0')}
                </CodeBadge>
              ) : (
                'não escolhido'
              )
            }
          />
        </Card>

        <Text style={[styles.secao, { color: c.muted }]}>1 · ESCOLHA A RUA</Text>
        <View style={styles.grade}>
          {ruas.map((rua) => {
            const { pct, livres } = ocupacaoDaRua(rua);
            const ativa = rua.id === ruaId;
            return (
              <Pressable
                key={rua.id}
                accessibilityRole="button"
                accessibilityState={{ selected: ativa }}
                onPress={() => {
                  setRuaId(rua.id);
                  setPosicaoId(null);
                }}
                style={({ pressed }) => [
                  styles.ruaCard,
                  {
                    backgroundColor: ativa ? c.primarySoft : c.surface,
                    borderColor: ativa ? c.primary : c.border,
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}>
                <Text style={[styles.ruaCodigo, { color: ativa ? c.primaryDark : c.text }]}>{rua.codigo}</Text>
                <Text style={{ color: c.muted, fontSize: Ui.font.xs }}>{rua.categoria}</Text>
                <Progresso pct={pct} tom={pct >= 95 ? 'red' : pct >= 80 ? 'amber' : 'green'} />
                <Text style={{ color: c.muted, fontSize: Ui.font.xs }}>
                  {pct}% · {livres} livre(s)
                </Text>
              </Pressable>
            );
          })}
        </View>

        {ruaId ? (
          <>
            <Text style={[styles.secao, { color: c.muted }]}>2 · ESCOLHA A POSIÇÃO</Text>
            <View style={styles.posicoes}>
              {posicoesDaRua.map((pos) => {
                const ativa = pos.id === posicaoId;
                return (
                  <Pressable
                    key={pos.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Posição ${pos.numero}, ${pos.ocupada ? 'ocupada' : 'livre'}`}
                    accessibilityState={{ selected: ativa, disabled: pos.ocupada }}
                    disabled={pos.ocupada}
                    onPress={() => setPosicaoId(pos.id)}
                    style={({ pressed }) => [
                      styles.posicao,
                      {
                        backgroundColor: pos.ocupada ? c.redSoft : ativa ? c.primary : c.surface,
                        borderColor: pos.ocupada ? c.red : ativa ? c.primary : c.border,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.posicaoTexto,
                        { color: pos.ocupada ? c.red : ativa ? '#ffffff' : c.text },
                      ]}>
                      {pos.numero}
                    </Text>
                  </Pressable>
                );
              })}
              {posicoesDaRua.length === 0 ? (
                <Text style={{ color: c.muted, fontSize: Ui.font.sm }}>Esta rua não tem posições cadastradas.</Text>
              ) : null}
            </View>
            <View style={styles.legenda}>
              <Pill tom="green">Livre</Pill>
              <Pill tom="red">Ocupada</Pill>
            </View>
          </>
        ) : null}

        {projecao ? (
          <Card>
            <Linha rotulo="Ocupação da rua agora" valor={`${projecao.antes}%`} />
            <Linha rotulo="Depois de guardar" valor={`${projecao.depois}%`} />
            <Progresso pct={projecao.depois} tom={projecao.depois >= 95 ? 'red' : projecao.depois >= 80 ? 'amber' : 'green'} />
          </Card>
        ) : null}

        <Button label="Confirmar Endereçamento" onPress={confirmar} disabled={!posicaoId} carregando={salvando} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1 },
  conteudo: { padding: 16, paddingBottom: 32, gap: 12 },
  topo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  titulo: { fontSize: Ui.font.lg, fontWeight: '700', flex: 1 },
  secao: { fontSize: Ui.font.xs, fontWeight: '700', letterSpacing: 0.6, marginTop: 8 },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  ruaCard: {
    flexGrow: 1,
    flexBasis: '45%',
    borderWidth: 1,
    borderRadius: Ui.radius,
    padding: 12,
    gap: 6,
    minHeight: Ui.touch + 30,
  },
  ruaCodigo: { fontSize: Ui.font.lg, fontWeight: '800' },
  posicoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  posicao: {
    width: 56,
    height: 56,
    borderWidth: 1,
    borderRadius: Ui.radiusSm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  posicaoTexto: { fontSize: Ui.font.md, fontWeight: '700' },
  legenda: { flexDirection: 'row', gap: 10 },
});
