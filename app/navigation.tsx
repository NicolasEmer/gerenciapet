import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import CreateAnimalScreen from './animais/create-animais';
import HomeScreen from './(tabs)/inicial';
import LoginScreen from './(tabs)/index';

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
          options={{ title: 'Cadastro de Animais' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Navigation;
