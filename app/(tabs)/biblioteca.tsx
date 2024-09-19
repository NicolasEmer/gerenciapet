import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native'; 
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation'; 

export default function App() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleNavigateToCadastroAnimais = () => {
    navigation.navigate('CreateAnimal');
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {/* Image Local */}
        <Image 
          style={styles.imageBox} 
          source={{ uri: 'https://via.placeholder.com/150.png?text=Image' }} 
        />
        {/* Text Local (Top right) */}
        <View style={styles.textBox}>
          <Text>
            Text local Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
            Etiam eget ligula eu lectus lobortis condimentum. Aliquam nonummy 
            auctor massa. Pellentesque habitant morbi tristique senectus et 
            netus et malesuada fames ac turpis egestas. Nulla at risus. 
            Quisque purus magna, auctor et, sagittis ac, posuere eu, lectus. 
            Nam mattis, felis ut adipiscing.
          </Text>
        </View>
      </View>

      {/* Bottom Text Local */}
      <View style={styles.largeTextBox}>
        <Text>
          Text local Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
          Etiam eget ligula eu lectus lobortis condimentum. Aliquam nonummy 
          auctor massa. Pellentesque habitant morbi tristique senectus et 
          netus et malesuada fames ac turpis egestas. Nulla at risus. 
          Quisque purus magna, auctor et, sagittis ac, posuere eu, lectus. 
          Nam mattis, felis ut adipiscing.
        </Text>
      </View>

      {/* Floating Button */}
      <TouchableOpacity 
        style={styles.floatingButton} 
        onPress={handleNavigateToCadastroAnimais}
      >
        <Text style={styles.buttonText}>☰</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    marginTop: 30
  },
  topRow: {
    flexDirection: 'row',
    height: '48%',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  imageBox: {
    width: '49%',
    height: '100%', 
    backgroundColor: '#ddd',
    borderRadius: 10,
  },
  textBox: {
    width: '49%',
    height: '100%', 
    backgroundColor: '#ddd',
    borderRadius: 10,
  },
  largeTextBox: {
    width: '100%',
    height: '48%',
    backgroundColor: '#ddd',
    borderRadius: 10
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007BFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
