import { useColorScheme } from 'react-native';

import { Golinho, type GolinhoPalette } from '@/constants/theme';

/** Paleta Golinho seguindo o tema do aparelho (claro/escuro). */
export function useGolinho(): GolinhoPalette {
  const scheme = useColorScheme();
  return Golinho[scheme === 'dark' ? 'dark' : 'light'];
}
