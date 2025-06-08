import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './src/services/AuthService';
import AppNavigator from './src/navigation/AppNavigator';
import { theme } from './src/utils/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={theme}>
          <AuthProvider>
            <StatusBar style="auto" />
            <AppNavigator />
          </AuthProvider>
        </PaperProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}