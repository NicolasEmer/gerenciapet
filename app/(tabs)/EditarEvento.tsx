import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, TouchableOpacity } from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import MapView, { Marker } from 'react-native-maps';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../config/firebaseConfig';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';

interface RouteParams {
  id: string;
}

const EditarEvento = () => {
  const [nome, setNome] = useState('');
  const [data, setData] = useState('');
  const [local, setLocal] = useState('');
  const [imageUrl, setImageUrl] = useState(''); // URL da imagem existente no Storage
  const [tempImage, setTempImage] = useState<string | null>(null); // Imagem temporária
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: -23.55052, // Posição inicial em São Paulo
    longitude: -46.633308,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [tempMapRegion, setTempMapRegion] = useState(mapRegion); // Região temporária do mapa
  
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'EditarEvento'>>();
  const route = useRoute();
  const { id } = route.params as RouteParams;

  // Função para carregar o evento do Firestore
  const carregarEvento = async () => {
    try {
      const eventoDoc = await getDoc(doc(db, 'eventos', id));
      if (eventoDoc.exists()) {
        const eventoData = eventoDoc.data();
        setNome(eventoData?.nome || '');
        setData(eventoData?.data || '');
        setLocal(eventoData?.local || '');
        setImageUrl(eventoData?.imageUrl || ''); // Recarregar a URL da imagem
        setLatitude(eventoData?.latitude || mapRegion.latitude);
        setLongitude(eventoData?.longitude || mapRegion.longitude);
        setMapRegion({
          ...mapRegion,
          latitude: eventoData?.latitude || mapRegion.latitude,
          longitude: eventoData?.longitude || mapRegion.longitude,
        });
        setTempMapRegion({
          ...mapRegion,
          latitude: eventoData?.latitude || mapRegion.latitude,
          longitude: eventoData?.longitude || mapRegion.longitude,
        });
        setTempImage(null); // Resetar imagem temporária ao recarregar o evento
      }
    } catch (error) {
      Alert.alert("Erro", "Erro ao carregar evento. Verifique a conexão.");
      console.error("Erro ao carregar evento: ", error);
    }
  };

  // Carregar evento ao acessar a página pela primeira vez
  useEffect(() => {
    carregarEvento();
  }, [id]);

  // Carregar evento sempre que a página for focada
  useFocusEffect(
    useCallback(() => {
      carregarEvento();
    }, [id])
  );

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setTempImage(result.assets[0].uri); // Define a URI da nova imagem temporariamente
    }
  };

  const atualizarEvento = async () => {
    try {
      let updatedImageUrl = imageUrl;

      if (tempImage) {
        // Deletar a imagem antiga antes de fazer o upload da nova
        if (imageUrl) {
          const oldImageRef = ref(storage, imageUrl);
          await deleteObject(oldImageRef).catch((error) => {
            console.warn('Erro ao deletar imagem antiga: ', error);
          });
        }

        // Fazer o upload da nova imagem
        const imageRef = ref(storage, `eventos/${nome}_${Date.now()}.jpg`);
        const img = await fetch(tempImage);
        const bytes = await img.blob();
        await uploadBytes(imageRef, bytes);
        updatedImageUrl = await getDownloadURL(imageRef); // Nova URL da imagem
      }

      // Atualizar o documento no Firestore com os novos dados e nova imagem
      await updateDoc(doc(db, 'eventos', id), {
        nome,
        data,
        local,
        imageUrl: updatedImageUrl,
        latitude: tempMapRegion.latitude,
        longitude: tempMapRegion.longitude,
      });

      Alert.alert('Sucesso', 'Evento atualizado com sucesso!');
      navigation.navigate('eventos');
    } catch (error) {
      Alert.alert('Erro', 'Erro ao atualizar evento. Verifique as permissões de acesso ao Firebase.');
      console.error('Erro ao atualizar evento:', error);
    }
  };

  const handleMapPress = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setTempMapRegion({
      ...tempMapRegion,
      latitude,
      longitude,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Evento</Text>
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
      {imageUrl && !tempImage && <Image source={{ uri: imageUrl }} style={styles.image} />}
      {tempImage && <Image source={{ uri: tempImage }} style={styles.image} />}

      <MapView
        style={styles.map}
        region={tempMapRegion}
        onPress={handleMapPress}
      >
        <Marker coordinate={{ latitude: tempMapRegion.latitude, longitude: tempMapRegion.longitude }} />
      </MapView>

      <TouchableOpacity style={styles.registerButton} onPress={atualizarEvento}>
        <Text style={styles.registerButtonText}>Salvar Alterações</Text>
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

export default EditarEvento;
