import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation'; // Adjust the import path as necessary

type HomeScreenProps = {
  navigation: NavigationProp<RootStackParamList>;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo(a) à ONG de Animais</Text>

      <View style={styles.buttonContainer}>
        <Button
          title="Biblioteca de Animais"
          onPress={() => navigation.navigate('Library')}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Doações"
          onPress={() => navigation.navigate('Donations')}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Eventos"
          onPress={() => navigation.navigate('Events')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  buttonContainer: {
    marginVertical: 8,
  },
});

export default HomeScreen;