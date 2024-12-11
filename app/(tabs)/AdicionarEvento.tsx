import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';

const AdicionarEvento = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'AdicionarEvento'>>();

  const [nome, setNome] = useState<string>('');
  const [data, setData] = useState<string>('');
  const [local, setLocal] = useState<string>('');
  const [image, setImage] = useState<string | null>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: -23.55052, // Posição inicial em São Paulo, por exemplo
    longitude: -46.633308,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [tempMapRegion, setTempMapRegion] = useState({
    latitude: -23.55052, // Posição inicial em São Paulo
    longitude: -46.633308,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [markerPosition, setMarkerPosition] = useState({
    latitude: -23.55052,
    longitude: -46.633308,
  });
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Permita o acesso à localização para selecionar o local do evento.');
        return;
      }
  
      let userLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = userLocation.coords;
  
      setLatitude(latitude);
      setLongitude(longitude);
      setTempMapRegion((prev) => ({
        ...prev,
        latitude,
        longitude,
      }));
    })();
  }, []);

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

  const adicionarEvento = async () => {
    try {
      if (!nome || !data || !local) {
        Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
        return;
      }
  
      let imageUrl = '';
      if (image) {
        const imageRef = ref(storage, `eventos/${nome}_${Date.now()}.jpg`);
        const img = await fetch(image);
        const bytes = await img.blob();
        await uploadBytes(imageRef, bytes);
        imageUrl = await getDownloadURL(imageRef);
      }
  
      const eventoData = {
        nome,
        data,
        local,
        imageUrl,
        latitude: tempMapRegion.latitude,
        longitude: tempMapRegion.longitude,
      };
  
      await addDoc(collection(db, 'eventos'), eventoData);
      Alert.alert('Sucesso', 'Evento cadastrado com sucesso!');
      navigation.navigate('eventos');
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao cadastrar o evento. Verifique as permissões de acesso ao Firebase.');
      console.error('Erro ao registrar evento:', error);
    }
  };

  const handleMapPress = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
  
    setTempMapRegion((prev) => ({
      ...prev,
      latitude,
      longitude,
    }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adicionar Evento</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome do Evento"
        value={nome}
        onChangeText={setNome}
      />
      <TextInput
        style={styles.input}
        placeholder="Data do Evento"
        value={data}
        onChangeText={setData}
      />
      <TextInput
        style={styles.input}
        placeholder="Local do Evento"
        value={local}
        onChangeText={setLocal}
      />

      <TouchableOpacity onPress={pickImage}>
        <Text style={styles.buttonText}>Selecionar Imagem</Text>
      </TouchableOpacity>

      {image && <Image source={{ uri: image }} style={styles.image} />}

      <MapView
        style={styles.map}
        region={tempMapRegion}
        onPress={handleMapPress}
      >
        <Marker coordinate={tempMapRegion} />
      </MapView>

      <TouchableOpacity style={styles.registerButton} onPress={adicionarEvento}>
        <Text style={styles.registerButtonText}>Adicionar Evento</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('eventos')}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({

  registerButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007bff',
    borderRadius: 50,
    paddingVertical: 15,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  backButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: '#ff4444',
    borderRadius: 50,
    paddingVertical: 15,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
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
  map: {
    width: '100%',
    height: 300,
    marginVertical: 20,
  },
});

export default AdicionarEvento;
