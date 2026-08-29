import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Ui } from '@/constants/theme';
import { useGolinho } from '@/hooks/use-golinho';

type Tom = 'green' | 'amber' | 'red' | 'blue' | 'gray';

/** Badge compacta com bolinha — mesma leitura das pills da Web. */
export function Pill({ tom, children }: { tom: Tom; children: ReactNode }) {
  const c = useGolinho();
  const cores: Record<Tom, { bg: string; fg: string }> = {
    green: { bg: c.primarySoft, fg: c.primaryDark },
    amber: { bg: c.amberSoft, fg: c.amber },
    red: { bg: c.redSoft, fg: c.red },
    blue: { bg: c.blueSoft, fg: c.blue },
    gray: { bg: c.bg, fg: c.muted },
  };
  const { bg, fg } = cores[tom];

  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <View style={[styles.dot, { backgroundColor: fg }]} />
      <Text style={[styles.pillText, { color: fg }]}>{children}</Text>
    </View>
  );
}

/** Código monoespaçado — placa, nota, endereço. */
export function CodeBadge({ children }: { children: ReactNode }) {
  const c = useGolinho();
  return (
    <View style={[styles.badge, { backgroundColor: c.badge }]}>
      <Text style={[styles.badgeText, { color: c.badgeText }]}>{children}</Text>
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const c = useGolinho();
  return <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }, style]}>{children}</View>;
}

export function Button({
  label,
  onPress,
  variante = 'primary',
  disabled,
  carregando,
}: {
  label: string;
  onPress: () => void;
  variante?: 'primary' | 'ghost' | 'danger';
  disabled?: boolean;
  carregando?: boolean;
}) {
  const c = useGolinho();
  const fundo = variante === 'primary' ? c.primary : variante === 'danger' ? c.red : c.surface;
  const texto = variante === 'ghost' ? c.text : '#ffffff';
  const borda = variante === 'ghost' ? c.border : fundo;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      onPress={onPress}
      disabled={disabled || carregando}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: fundo, borderColor: borda, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
      ]}>
      {carregando ? <ActivityIndicator color={texto} /> : <Text style={[styles.buttonText, { color: texto }]}>{label}</Text>}
    </Pressable>
  );
}

/** Barra de progresso da conferência / ocupação da rua. */
export function Progresso({ pct, tom = 'green' }: { pct: number; tom?: Tom }) {
  const c = useGolinho();
  const cor = tom === 'red' ? c.red : tom === 'amber' ? c.amber : c.primary;
  return (
    <View style={[styles.trilho, { backgroundColor: c.bg }]}>
      <View style={[styles.preenchimento, { backgroundColor: cor, width: `${Math.min(100, Math.max(0, pct))}%` }]} />
    </View>
  );
}

export function Aviso({ texto, tom = 'red' }: { texto: string; tom?: Tom }) {
  const c = useGolinho();
  const fundo = tom === 'red' ? c.redSoft : tom === 'amber' ? c.amberSoft : c.blueSoft;
  const cor = tom === 'red' ? c.red : tom === 'amber' ? c.amber : c.blue;
  return (
    <View style={[styles.aviso, { backgroundColor: fundo, borderColor: cor }]}>
      <Text style={{ color: cor, fontSize: Ui.font.sm }}>{texto}</Text>
    </View>
  );
}

export function Linha({ rotulo, valor }: { rotulo: string; valor: ReactNode }) {
  const c = useGolinho();
  return (
    <View style={styles.linha}>
      <Text style={{ color: c.muted, fontSize: Ui.font.sm }}>{rotulo}</Text>
      {typeof valor === 'string' || typeof valor === 'number' ? (
        <Text style={{ color: c.text, fontSize: Ui.font.sm, fontWeight: '600' }}>{valor}</Text>
      ) : (
        valor
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  dot: { width: 7, height: 7, borderRadius: 999 },
  pillText: { fontSize: Ui.font.xs, fontWeight: '700' },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Ui.radiusSm,
    alignSelf: 'flex-start',
  },
  badgeText: { fontFamily: 'monospace', fontSize: Ui.font.xs, fontWeight: '700' },
  card: {
    borderWidth: 1,
    borderRadius: Ui.radius,
    padding: 16,
    gap: 12,
  },
  button: {
    minHeight: Ui.touch,
    borderRadius: Ui.radius,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  buttonText: { fontSize: Ui.font.md, fontWeight: '700' },
  trilho: { height: 8, borderRadius: 999, overflow: 'hidden' },
  preenchimento: { height: 8, borderRadius: 999 },
  aviso: { borderWidth: 1, borderRadius: Ui.radiusSm, padding: 12 },
  linha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
});
