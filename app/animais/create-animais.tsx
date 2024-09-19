import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';

export default function AnimalRegistrationScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'CreateAnimal'>>();

  const [animalName, setAnimalName] = useState<string>('');
  const [animalType, setAnimalType] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const handleRegistration = () => {
    if (!animalName || !animalType || !age) {
      Alert.alert('Erro', 'Todos os campos devem ser preenchidos.');
      return;
    }

    Alert.alert('Sucesso', 'Animal cadastrado com sucesso!');
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro de Animais</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome do Animal"
        value={animalName}
        onChangeText={setAnimalName}
      />
      <TextInput
        style={styles.input}
        placeholder="Tipo do Animal (Ex: Cachorro, Gato)"
        value={animalType}
        onChangeText={setAnimalType}
      />
      <TextInput
        style={styles.input}
        placeholder="Idade"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Descrição (opcional)"
        value={description}
        onChangeText={setDescription}
      />
      <View style={styles.buttonContainer}>
        <Button title="Cadastrar Animal" onPress={handleRegistration} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    marginTop: 16,
  },
});
