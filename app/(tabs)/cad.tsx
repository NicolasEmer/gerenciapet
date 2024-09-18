import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { auth } from '../../config/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';  // Importe o hook
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Defina o tipo para a navegação
type RootStackParamList = {
  index: undefined;
};

export default function SignupScreen() {
  // Defina o tipo de navegação usando NativeStackNavigationProp
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [email, setEmail] = useState<string>('');  // Defina o tipo de estado como string
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const handleSignup = () => {
    if (!email.includes('@')) {
      Alert.alert('Erro', 'Por favor, insira um email válido.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        console.log('Usuário registrado com sucesso:', userCredential.user);
        Alert.alert('Sucesso', 'Usuário registrado com sucesso!');
        navigation.navigate('index');
      })
      .catch(error => {
        console.error('Erro ao registrar:', error);
        Alert.alert('Erro', error.message);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Confirmar Senha"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <View style={styles.buttonContainer}>
        <Button title="Cadastrar" onPress={handleSignup} />
        <View style={styles.buttonSpacing} />
        <Button title="Já tem uma conta? Faça login" onPress={() => navigation.navigate('index')} color="grey" />
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
  buttonSpacing: {
    marginVertical: 8, // Espaçamento vertical entre os botões
  },
});
