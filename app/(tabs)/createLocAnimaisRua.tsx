import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, TouchableOpacity, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebaseConfig';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';

console.log('FOIIII!');

const ReportarLocAnimal = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'ReportarLocAnimal'>>();

  const [animalType, setAnimalType] = useState<string>('');
  const [breed, setBreed] = useState<string>('');
  const [color, setColor] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mapVisible, setMapVisible] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleMapPress = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setLocation({ latitude, longitude });
    setMapVisible(false);
  };

  const handleRegistration = async () => {
    try {
      if (!animalType || !breed || !color || !description || !location) {
        Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
        return;
      }

      let imageUrl = '';
      if (image) {
        const imageRef = ref(storage, `animals/${Date.now()}.jpg`);
        const img = await fetch(image);
        const bytes = await img.blob();
        await uploadBytes(imageRef, bytes);
        imageUrl = await getDownloadURL(imageRef);
      }

      const animalData = {
        type: animalType,
        breed: breed,
        color: color,
        description: description,
        image: imageUrl,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        reportedAt: new Date(),
      };

      await addDoc(collection(db, 'reportedAnimals'), animalData);
      Alert.alert('Sucesso', 'Localização do animal registrada com sucesso!');
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao registrar a localização do animal.');
      console.error('Erro ao registrar animal:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reportar Animal de Rua</Text>

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
        placeholder="Cor"
        value={color}
        onChangeText={setColor}
      />
      <TextInput
        style={styles.input}
        placeholder="Descrição (Ex: Machucado, Agressivo)"
        value={description}
        onChangeText={setDescription}
      />

      <TouchableOpacity onPress={pickImage}>
        <Text style={styles.buttonText}>Selecionar Imagem</Text>
      </TouchableOpacity>
      {image && <Image source={{ uri: image }} style={styles.image} />}

      <TouchableOpacity onPress={() => setMapVisible(true)}>
        <Text style={styles.buttonText}>Selecionar Localização no Mapa</Text>
      </TouchableOpacity>
      {location && (
        <Text style={styles.locationText}>
          Localização: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
        </Text>
      )}

      <View style={styles.buttonContainer}>
        <Button title="Reportar Animal" onPress={handleRegistration} />
      </View>

      <Modal visible={mapVisible} animationType="slide" transparent={false}>
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: -15.7942,
            longitude: -47.8822,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          onPress={handleMapPress}
        >
          {location && <Marker coordinate={location} />}
        </MapView>
        <Button title="Fechar" onPress={() => setMapVisible(false)} />
      </Modal>
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
  locationText: {
    marginTop: 10,
    fontSize: 16,
    fontStyle: 'italic',
  },
  buttonContainer: {
    marginTop: 16,
  },
});

export default ReportarLocAnimal;