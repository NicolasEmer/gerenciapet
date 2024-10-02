import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import CreateAnimalScreen from './(tabs)/create-animais';
import HomeScreen from './(tabs)/inicial';
import LoginScreen from './(tabs)/index';
import LibraryScreen from './(tabs)/biblioteca';
import DonationsScreen from './(tabs)/doacoes';
import EventsScreen from './(tabs)/eventos';

export type RootStackParamList = {
  Home: undefined;
  CreateAnimal: undefined;
  Index: undefined;
  Library: undefined;
  Donations: undefined;
  Events: undefined;
  Cad: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Página Inicial' }}
        />
        <Stack.Screen
          name="CreateAnimal"
          component={CreateAnimalScreen}
          options={{ title: 'Cadastro de Animais' }}
        />
        <Stack.Screen
          name="Index"
          component={LoginScreen}
          options={{ title: 'Login' }}
        />
        <Stack.Screen
          name="Library"
          component={LibraryScreen}
          options={{ title: 'View do Animal' }}
        />
        <Stack.Screen
          name="Donations"
          component={DonationsScreen}
          options={{ title: 'Doações' }}
        />
        <Stack.Screen
          name="Events"
          component={EventsScreen}
          options={{ title: 'Eventos' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Navigation;
