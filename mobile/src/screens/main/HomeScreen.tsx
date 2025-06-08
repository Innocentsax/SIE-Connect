import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, Button, Chip, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

import { useAuth } from '../../services/AuthService';
import { apiClient } from '../../services/AuthService';
import { theme, spacing, typography } from '../../utils/theme';

interface DashboardStats {
  startups: number;
  opportunities: number;
  investors: number;
  totalUsers: number;
}

interface RecentActivity {
  id: number;
  type: 'opportunity' | 'startup' | 'application';
  title: string;
  description: string;
  time: string;
}

const HomeScreen = () => {
  const { user } = useAuth();
  
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await apiClient.request<DashboardStats>('/api/stats');
      return response.data;
    },
  });

  const { data: recentActivity, isLoading: activityLoading, refetch: refetchActivity } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const response = await apiClient.request<RecentActivity[]>('/api/recent-activity');
      return response.data || [];
    },
  });

  const handleRefresh = async () => {
    await Promise.all([refetchStats(), refetchActivity()]);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoleSpecificContent = () => {
    switch (user?.role) {
      case 'FOUNDER':
        return {
          title: 'Funding Opportunities',
          subtitle: 'Discover funding options for your startup',
          icon: 'rocket-launch',
          action: 'Explore Opportunities',
        };
      case 'FUNDER':
        return {
          title: 'Investment Deals',
          subtitle: 'Find promising startups to invest in',
          icon: 'trending-up',
          action: 'Browse Startups',
        };
      case 'ECOSYSTEM_BUILDER':
        return {
          title: 'Ecosystem Insights',
          subtitle: 'Track ecosystem growth and trends',
          icon: 'chart-line',
          action: 'View Analytics',
        };
      default:
        return {
          title: 'Ecosystem Overview',
          subtitle: 'Explore the startup ecosystem',
          icon: 'compass',
          action: 'Get Started',
        };
    }
  };

  const roleContent = getRoleSpecificContent();
  const isLoading = statsLoading || activityLoading;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>
              {getGreeting()}, {user?.name || 'User'}
            </Text>
            <Text style={styles.roleText}>
              {user?.role?.replace('_', ' ')} • Malaysian Startup Ecosystem
            </Text>
          </View>
          <Avatar.Icon 
            size={48} 
            icon="account" 
            style={styles.avatar}
          />
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <MaterialCommunityIcons 
                name="rocket-launch" 
                size={24} 
                color={theme.colors.primary} 
              />
              <Text style={styles.statNumber}>{stats?.startups || 0}</Text>
              <Text style={styles.statLabel}>Startups</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <MaterialCommunityIcons 
                name="currency-usd" 
                size={24} 
                color={theme.colors.secondary} 
              />
              <Text style={styles.statNumber}>{stats?.opportunities || 0}</Text>
              <Text style={styles.statLabel}>Opportunities</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <MaterialCommunityIcons 
                name="account-group" 
                size={24} 
                color={theme.colors.tertiary} 
              />
              <Text style={styles.statNumber}>{stats?.totalUsers || 0}</Text>
              <Text style={styles.statLabel}>Members</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Role-specific Action Card */}
        <Card style={styles.actionCard}>
          <Card.Content>
            <View style={styles.actionHeader}>
              <MaterialCommunityIcons 
                name={roleContent.icon as any} 
                size={32} 
                color={theme.colors.primary} 
              />
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>{roleContent.title}</Text>
                <Text style={styles.actionSubtitle}>{roleContent.subtitle}</Text>
              </View>
            </View>
            <Button 
              mode="contained" 
              style={styles.actionButton}
              onPress={() => {}}
            >
              {roleContent.action}
            </Button>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.quickActionsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <Button 
                mode="outlined" 
                style={styles.quickActionButton}
                onPress={() => {}}
              >
                Search
              </Button>
              <Button 
                mode="outlined" 
                style={styles.quickActionButton}
                onPress={() => {}}
              >
                Discovery
              </Button>
              {(user?.role === 'FOUNDER' || user?.role === 'FUNDER') && (
                <Button 
                  mode="outlined" 
                  style={styles.quickActionButton}
                  onPress={() => {}}
                >
                  Applications
                </Button>
              )}
              <Button 
                mode="outlined" 
                style={styles.quickActionButton}
                onPress={() => {}}
              >
                Profile
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Recent Activity */}
        <Card style={styles.activityCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.slice(0, 5).map((activity) => (
                <View key={activity.id} style={styles.activityItem}>
                  <MaterialCommunityIcons 
                    name={
                      activity.type === 'opportunity' ? 'currency-usd' :
                      activity.type === 'startup' ? 'rocket-launch' : 'file-document'
                    } 
                    size={20} 
                    color={theme.colors.primary} 
                  />
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityDescription}>{activity.description}</Text>
                    <Text style={styles.activityTime}>{activity.time}</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyActivity}>
                <MaterialCommunityIcons 
                  name="information" 
                  size={32} 
                  color={theme.colors.onSurfaceVariant} 
                />
                <Text style={styles.emptyActivityText}>
                  No recent activity. Start exploring to see updates here.
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Malaysian Ecosystem Focus */}
        <Card style={styles.ecosystemCard}>
          <Card.Content>
            <View style={styles.ecosystemHeader}>
              <Text style={styles.sectionTitle}>🇲🇾 Malaysian Startup Ecosystem</Text>
              <Chip mode="outlined" style={styles.ecosystemChip}>
                Southeast Asia Hub
              </Chip>
            </View>
            <Text style={styles.ecosystemText}>
              Connect with Malaysia's thriving startup community. Discover opportunities 
              in fintech, e-commerce, healthtech, and social enterprise sectors.
            </Text>
            <Button 
              mode="text" 
              style={styles.ecosystemButton}
              onPress={() => {}}
            >
              Learn More About Malaysian Startups
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: theme.colors.primary,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    ...typography.h3,
    color: theme.colors.onPrimary,
    marginBottom: spacing.xs,
  },
  roleText: {
    ...typography.caption,
    color: theme.colors.onPrimary,
    opacity: 0.9,
  },
  avatar: {
    backgroundColor: theme.colors.onPrimary,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  statNumber: {
    ...typography.h3,
    color: theme.colors.onSurface,
    marginTop: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: theme.colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  actionCard: {
    margin: spacing.md,
    marginTop: 0,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  actionText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  actionTitle: {
    ...typography.h4,
    color: theme.colors.onSurface,
  },
  actionSubtitle: {
    ...typography.body,
    color: theme.colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  actionButton: {
    marginTop: spacing.sm,
  },
  quickActionsCard: {
    margin: spacing.md,
    marginTop: 0,
  },
  sectionTitle: {
    ...typography.h4,
    color: theme.colors.onSurface,
    marginBottom: spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickActionButton: {
    flex: 1,
    minWidth: '45%',
  },
  activityCard: {
    margin: spacing.md,
    marginTop: 0,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  activityContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  activityTitle: {
    ...typography.body,
    color: theme.colors.onSurface,
    fontWeight: '600',
  },
  activityDescription: {
    ...typography.caption,
    color: theme.colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  activityTime: {
    ...typography.small,
    color: theme.colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  emptyActivity: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  emptyActivityText: {
    ...typography.body,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  ecosystemCard: {
    margin: spacing.md,
    marginTop: 0,
    marginBottom: spacing.xl,
  },
  ecosystemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  ecosystemChip: {
    backgroundColor: theme.colors.secondaryContainer,
  },
  ecosystemText: {
    ...typography.body,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  ecosystemButton: {
    alignSelf: 'flex-start',
  },
});

export default HomeScreen;