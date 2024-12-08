import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import Home from './(tabs)/Home';
import CreateAnimalScreen from './(tabs)/createAnimais';
import LoginScreen from './(tabs)/index';
import DonationsScreen from './(tabs)/doacoes';
import EventsScreen from './(tabs)/eventos';
import AdicionarEvento from './(tabs)/AdicionarEvento';
import EditarEvento from './(tabs)/EditarEvento';
import SignupScreen from './(tabs)/cad';
import AnimalListScreen from './(tabs)/listAnimais';
import ListarProduto from './(tabs)/listItem';
import CadProduto from './(tabs)/createItem';
import ReportarLocAnimal from './(tabs)/createLocAnimaisRua';
import ListagemLocAnimaisRua from './(tabs)/listLocAnimaisRua';

export type RootStackParamList = {
  createItem: undefined;
  listItem: undefined;
  listAnimais: undefined;
  Home: undefined;
  ReportarLocAnimal: undefined;
  createAnimais: undefined;
  index: undefined;
  doacoes: undefined;
  eventos: undefined;
  AdicionarEvento: undefined;
  EditarEvento: { id: string }; // Aceita parâmetro `id`
  cad: undefined;
  listagem: undefined;
  objetos: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="index">
        <Stack.Screen
          name="createItem"
          component={CadProduto}
          options={{ title: 'Cadastrar Animais' }}
        />
        <Stack.Screen
          name="listagem"
          component={ListagemLocAnimaisRua}
          options={{ title: 'Listagem Localicação Animais' }}
        />
        <Stack.Screen
          name="listItem"
          component={ListarProduto}
          options={{ title: 'Listar Animais' }}
        />
        <Stack.Screen
          name="listAnimais"
          component={AnimalListScreen}
          options={{ title: 'Listar Animais' }}
        />
        <Stack.Screen
          name="index"
          component={LoginScreen}
          options={{ title: 'Login' }}
        />
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ title: 'Gerencia Pet' }}
        />
        <Stack.Screen
          name="ReportarLocAnimal"
          component={ReportarLocAnimal}
          options={{ title: 'Localizacao Animais' }}
        />
        <Stack.Screen
          name="createAnimais"
          component={CreateAnimalScreen}
          options={{ title: 'Cadastro de Animais' }}
        />
        <Stack.Screen
          name="doacoes"
          component={DonationsScreen}
          options={{ title: 'Doações' }}
        />
        <Stack.Screen
          name="eventos"
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
          options={{
            title: 'Editar Evento',
            presentation: 'modal', // Opção para abrir como modal
          }}
        />
        <Stack.Screen
          name="cad"
          component={SignupScreen}
          options={{ title: 'Cadastro' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
