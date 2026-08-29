import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

import { Golinho } from '@/constants/theme';

export default function RootLayout() {
  const scheme = useColorScheme();
  const escuro = scheme === 'dark';
  const c = Golinho[escuro ? 'dark' : 'light'];

  const base = escuro ? DarkTheme : DefaultTheme;
  const tema = {
    ...base,
    colors: {
      ...base.colors,
      primary: c.primary,
      background: c.bg,
      card: c.surface,
      text: c.text,
      border: c.border,
    },
  };

  return (
    <ThemeProvider value={tema}>
      <StatusBar style={escuro ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: c.surface },
          headerTintColor: c.text,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: c.bg },
        }}>
        <Stack.Screen name="index" options={{ title: 'Golinho · Coletor' }} />
        <Stack.Screen name="doca/[id]" options={{ title: 'Conferência da carga' }} />
        <Stack.Screen name="enderecar/[id]" options={{ title: 'Endereçar palete' }} />
      </Stack>
    </ThemeProvider>
  );
}
