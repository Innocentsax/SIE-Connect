import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, TextInput, Text, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '../../services/AuthService';
import { theme, spacing, typography } from '../../utils/theme';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!email || !password) {
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      // Error handling is done in the auth service
    } finally {
      setLoading(false);
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('Register' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to access your startup ecosystem</Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={styles.input}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry={!showPassword}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              style={styles.input}
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading || !email || !password}
              style={styles.loginButton}
            >
              Sign In
            </Button>
          </Card.Content>
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <Button
            mode="text"
            onPress={navigateToRegister}
            style={styles.registerButton}
          >
            Sign Up
          </Button>
        </View>

        <View style={styles.testCredentials}>
          <Text style={styles.testTitle}>Test Credentials:</Text>
          <Text style={styles.testText}>Founder: founder@test.com / password123</Text>
          <Text style={styles.testText}>Funder: funder@test.com / password123</Text>
          <Text style={styles.testText}>Admin: admin@test.com / password123</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.md,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: theme.colors.onBackground,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  card: {
    marginBottom: spacing.lg,
  },
  input: {
    marginBottom: spacing.md,
  },
  loginButton: {
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  footerText: {
    ...typography.body,
    color: theme.colors.onSurfaceVariant,
  },
  registerButton: {
    marginLeft: spacing.sm,
  },
  testCredentials: {
    backgroundColor: theme.colors.surfaceVariant,
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.lg,
  },
  testTitle: {
    ...typography.h4,
    color: theme.colors.onSurface,
    marginBottom: spacing.sm,
  },
  testText: {
    ...typography.caption,
    color: theme.colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
});

export default LoginScreen;