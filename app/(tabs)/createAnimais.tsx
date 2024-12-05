import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';

export default function AnimalRegistrationScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'createAnimais'>>();

  // Estados para capturar dados do formulário
  const [animalName, setAnimalName] = useState<string>('');
  const [animalType, setAnimalType] = useState<string>('');
  const [breed, setBreed] = useState<string>(''); // Nova propriedade: Raça
  const [gender, setGender] = useState<string>(''); // Nova propriedade: Gênero
  const [age, setAge] = useState<string>('');
  const [isVaccinated, setIsVaccinated] = useState<boolean>(false); // Nova propriedade: Vacinação
  const [isCastrated, setIsCastrated] = useState<boolean>(false); // Nova propriedade: Castração
  const [description, setDescription] = useState<string>('');
  const [adoptionStatus, setAdoptionStatus] = useState<string>('Disponível'); // Status de adoção
  const [image, setImage] = useState<string | null>(null); // Foto do animal
  const [size, setSize] = useState<string>('Pequeno'); // Novo estado para o porte do animal

  // Função para selecionar a imagem do animal
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Função para registrar o animal no Firebase
  const handleRegistration = async () => {
    try {
      if (!animalName || !animalType || !age || !breed || !gender) {
        Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
        return;
      }

      let imageUrl = '';
      if (image) {
        const imageRef = ref(storage, `animals/${animalName}_${Date.now()}.jpg`);
        const img = await fetch(image);
        const bytes = await img.blob();
        await uploadBytes(imageRef, bytes);
        imageUrl = await getDownloadURL(imageRef);
      }

      const animalData = {
        name: animalName,
        type: animalType,
        breed: breed,
        gender: gender,
        age: age,
        isVaccinated: isVaccinated,
        isCastrated: isCastrated,
        description: description,
        adoptionStatus: adoptionStatus,
        image: imageUrl,
        size: size,
      };

      await addDoc(collection(db, 'animals'), animalData);
      Alert.alert('Sucesso', 'Animal cadastrado com sucesso!');
      navigation.navigate('listAnimais');
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao cadastrar o animal. Verifique as permissões de acesso ao Firebase.');
      console.error('Erro ao registrar animal:', error);
    }
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
        placeholder="Raça"
        value={breed}
        onChangeText={setBreed}
      />
      <TextInput
        style={styles.input}
        placeholder="Gênero (Ex: Macho, Fêmea)"
        value={gender}
        onChangeText={setGender}
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
        placeholder="Descrição"
        value={description}
        onChangeText={setDescription}
      />

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Porte do Animal:</Text>
        <TouchableOpacity onPress={() => setSize('Pequeno')}>
          <Text style={size === 'Pequeno' ? styles.checked : styles.unchecked}>Pequeno</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSize('Médio')}>
          <Text style={size === 'Médio' ? styles.checked : styles.unchecked}>Médio</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSize('Grande')}>
          <Text style={size === 'Grande' ? styles.checked : styles.unchecked}>Grande</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={pickImage}>
        <Text style={styles.buttonText}>Selecionar Imagem</Text>
      </TouchableOpacity>
      {image && <Image source={{ uri: image }} style={styles.image} />}

      <View style={styles.checkboxContainer}>
        <Text>Vacinação:</Text>
        <TouchableOpacity onPress={() => setIsVaccinated(!isVaccinated)}>
          <Text style={isVaccinated ? styles.checked : styles.unchecked}>
            {isVaccinated ? 'Sim' : 'Não'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.checkboxContainer}>
        <Text>Castração:</Text>
        <TouchableOpacity onPress={() => setIsCastrated(!isCastrated)}>
          <Text style={isCastrated ? styles.checked : styles.unchecked}>
            {isCastrated ? 'Sim' : 'Não'}
          </Text>
        </TouchableOpacity>
      </View>

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
  buttonText: {
    color: '#007bff',
    marginBottom: 12,
  },
  image: {
    width: 100,
    height: 100,
    marginVertical: 10,
    borderRadius: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  checked: {
    color: 'green',
    fontWeight: 'bold',
  },
  unchecked: {
    color: 'red',
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
});
