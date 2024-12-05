import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebaseConfig'; // Atualize conforme necessário
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';

export default function SignupScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList,'cad'>>();
  
  // Estados para email, senha e confirmação de senha
  const [email, setEmail] = useState<string>('');
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
      {/* Logo */}
      <Image source={require('../../assets/images/logo.png')} style={styles.logo} />

      {/* Título */}
      <Text style={styles.title}>Cadastro</Text>

      {/* Campo de Email */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Campo de Senha */}
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Campo de Confirmar Senha */}
      <TextInput
        style={styles.input}
        placeholder="Confirmar Senha"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      {/* Botão de Cadastro */}
      <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
        <Text style={styles.signupButtonText}>Cadastrar</Text>
      </TouchableOpacity>

      {/* Botão de Login */}
      <TouchableOpacity onPress={() => navigation.navigate('index')}>
        <Text style={styles.loginText}>Já tem uma conta? Faça login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 12,
  },
  signupButton: {
    width: '100%',
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  signupButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginText: {
    color: '#007BFF',
    fontSize: 14,
    marginTop: 10,
  },
});

