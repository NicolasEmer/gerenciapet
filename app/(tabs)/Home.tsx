import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';

const Home = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Home'>>();

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/logo.png')}
      />
      <Text style={styles.title}>Bem-vindo ao GerenciaPet</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('listAnimais')}
      >
        <Text style={styles.buttonText}>Biblioteca de animais</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('eventos')}
      >
        <Text style={styles.buttonText}>Ver eventos</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('listItem')}
      >
        <Text style={styles.buttonText}>Nosso estoque</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('doacoes')}
      >
        <Text style={styles.buttonText}>Nos ajude a salvar vidas!</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttoni}
        onPress={() => navigation.navigate('listLocAnimaisRua')}
      >
        <Text style={styles.buttonText}>Lista de animais perdidos</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
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
