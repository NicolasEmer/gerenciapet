import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen({ navigation }) {
  navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo(a) à ONG de Animais</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Biblioteca de Animais"
          onPress={() => navigation.navigate('biblioteca')}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Doações"
          onPress={() => navigation.navigate('doacoes')}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Eventos"
          onPress={() => navigation.navigate('eventos')}
        />
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
  buttonContainer: {
    marginVertical: 10, // Adiciona um espaço entre os botões
  },
});
