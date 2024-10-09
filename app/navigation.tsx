import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import CreateAnimalScreen from './(tabs)/create-animais';
import LoginScreen from './(tabs)/index';
import DonationsScreen from './(tabs)/doacoes';
import EventsScreen from './(tabs)/eventos';
import AdicionarEvento from './(tabs)/AdicionarEvento';
import EditarEvento from './(tabs)/EditarEvento';

export type RootStackParamList = {
  Home: undefined;
  CreateAnimal: undefined;
  Index: undefined;
  Library: undefined;
  Donations: undefined;
  Events: undefined;
  AdicionarEvento: undefined;
  EditarEvento: { id: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
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
          name="Donations"
          component={DonationsScreen}
          options={{ title: 'Doações' }}
        />
        <Stack.Screen
          name="Events"
          component={EventsScreen}
          options={{ title: 'Eventos' }}
        />
        <Stack.Screen
          name="AdicionarEvento"
          component={AdicionarEvento}
          options={{ title: 'Adicionar Evento' }}
        />
        <Stack.Screen
          name="EditarEvento"
          component={EditarEvento}
          options={{ title: 'Editar Evento' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Navigation;
