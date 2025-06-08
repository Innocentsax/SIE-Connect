import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAuth } from '../services/AuthService';
import { theme } from '../utils/theme';
import { RootStackParamList } from '../types';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main Screens
import HomeScreen from '../screens/main/HomeScreen';

const AuthStack = createStackNavigator<RootStackParamList>();
const MainTab = createBottomTabNavigator();
const RootStack = createStackNavigator<RootStackParamList>();

const AuthStackNavigator = () => (
  <AuthStack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

const MainTabNavigator = () => (
  <MainTab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: string;

        switch (route.name) {
          case 'Home':
            iconName = focused ? 'home' : 'home-outline';
            break;
          case 'Search':
            iconName = focused ? 'magnify' : 'magnify';
            break;
          case 'Discovery':
            iconName = focused ? 'compass' : 'compass-outline';
            break;
          case 'Applications':
            iconName = focused ? 'file-document' : 'file-document-outline';
            break;
          case 'Profile':
            iconName = focused ? 'account' : 'account-outline';
            break;
          default:
            iconName = 'help-circle-outline';
        }

        return <MaterialCommunityIcons name={iconName as any} size={size} color={color} />;
      },
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
      tabBarStyle: {
        backgroundColor: theme.colors.surface,
        borderTopColor: theme.colors.outline,
      },
      headerStyle: {
        backgroundColor: theme.colors.primary,
      },
      headerTintColor: theme.colors.onPrimary,
      headerTitleStyle: {
        fontWeight: '600',
      },
    })}
  >
    <MainTab.Screen 
      name="Home" 
      component={HomeScreen}
      options={{
        title: 'Dashboard',
        headerShown: false,
      }}
    />
    <MainTab.Screen 
      name="Search" 
      component={HomeScreen} // Placeholder - would be SearchScreen
      options={{
        title: 'Search',
      }}
    />
    <MainTab.Screen 
      name="Discovery" 
      component={HomeScreen} // Placeholder - would be DiscoveryScreen
      options={{
        title: 'Discovery',
      }}
    />
    <MainTab.Screen 
      name="Applications" 
      component={HomeScreen} // Placeholder - would be ApplicationsScreen
      options={{
        title: 'Applications',
      }}
    />
    <MainTab.Screen 
      name="Profile" 
      component={HomeScreen} // Placeholder - would be ProfileScreen
      options={{
        title: 'Profile',
      }}
    />
  </MainTab.Navigator>
);

const RootNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // Could add a loading screen here
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <RootStack.Screen name="Main" component={MainTabNavigator} />
      ) : (
        <RootStack.Screen name="Auth" component={AuthStackNavigator} />
      )}
    </RootStack.Navigator>
  );
};

const AppNavigator = () => (
  <NavigationContainer>
    <RootNavigator />
  </NavigationContainer>
);

export default AppNavigator;