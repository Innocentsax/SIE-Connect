import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, TextInput, Text, Card, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '../../services/AuthService';
import { theme, spacing, typography } from '../../utils/theme';
import { RegisterData } from '../../types';

const RegisterScreen = () => {
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    name: '',
    role: 'FOUNDER',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigation = useNavigation();

  const handleRegister = async () => {
    if (!formData.email || !formData.password || !formData.name || !confirmPassword) {
      return;
    }

    if (formData.password !== confirmPassword) {
      return;
    }

    setLoading(true);
    try {
      await register(formData);
    } catch (error) {
      // Error handling is done in the auth service
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login' as never);
  };

  const roleOptions = [
    { value: 'FOUNDER', label: 'Founder' },
    { value: 'FUNDER', label: 'Funder' },
    { value: 'ECOSYSTEM_BUILDER', label: 'Builder' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Join the Ecosystem</Text>
          <Text style={styles.subtitle}>Create your account to connect with the startup community</Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="Full Name"
              value={formData.name}
              onChangeText={(name) => setFormData({ ...formData, name })}
              mode="outlined"
              autoCapitalize="words"
              style={styles.input}
            />

            <TextInput
              label="Email"
              value={formData.email}
              onChangeText={(email) => setFormData({ ...formData, email })}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={styles.input}
            />

            <View style={styles.roleSection}>
              <Text style={styles.roleLabel}>I am a:</Text>
              <SegmentedButtons
                value={formData.role}
                onValueChange={(role) => setFormData({ ...formData, role: role as any })}
                buttons={roleOptions}
                style={styles.roleButtons}
              />
            </View>

            <TextInput
              label="Password"
              value={formData.password}
              onChangeText={(password) => setFormData({ ...formData, password })}
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

            <TextInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              mode="outlined"
              secureTextEntry={!showPassword}
              style={styles.input}
              error={confirmPassword !== '' && formData.password !== confirmPassword}
            />

            <Button
              mode="contained"
              onPress={handleRegister}
              loading={loading}
              disabled={
                loading ||
                !formData.email ||
                !formData.password ||
                !formData.name ||
                !confirmPassword ||
                formData.password !== confirmPassword
              }
              style={styles.registerButton}
            >
              Create Account
            </Button>
          </Card.Content>
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Button
            mode="text"
            onPress={navigateToLogin}
            style={styles.loginButton}
          >
            Sign In
          </Button>
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
  roleSection: {
    marginBottom: spacing.md,
  },
  roleLabel: {
    ...typography.body,
    color: theme.colors.onSurface,
    marginBottom: spacing.sm,
  },
  roleButtons: {
    marginBottom: spacing.sm,
  },
  registerButton: {
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    ...typography.body,
    color: theme.colors.onSurfaceVariant,
  },
  loginButton: {
    marginLeft: spacing.sm,
  },
});

export default RegisterScreen;