import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';

const Home = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList,'home'>>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-Vindo ao GerenciaPet</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('listAnimais')}
      >
        <Text style={styles.buttonText}>Biblioteca de Animais</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('eventos')}
      >
        <Text style={styles.buttonText}>Ver Eventos</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('listItem')}
      >
        <Text style={styles.buttonText}>Nosso Estoque</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          navigation.navigate('doacoes');
        }}
        
      >
        <Text style={styles.buttonText}>Nos Ajude a Salvar Vidas!</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttoni}
        onPress={() => {
          navigation.navigate('doacoes');
        }}
        
      >
        <Text style={styles.buttonText}>Informar Animal Perdido</Text>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    width: '80%',
    padding: 15,
    marginVertical: 10,
    backgroundColor: '#007bff',
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttoni: {
    width: '80%',
    padding: 15,
    marginVertical: 10,
    backgroundColor: '#eb3434',
    borderRadius: 10,
    alignItems: 'center',
  },
});

export default Home;