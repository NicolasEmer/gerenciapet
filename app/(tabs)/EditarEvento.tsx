import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, TouchableOpacity } from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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
  const [imageUrl, setImageUrl] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'EditarEvento'>>();
  const route = useRoute();

  const { id } = route.params as RouteParams;

  useEffect(() => {
    const carregarEvento = async () => {
      try {
        const eventoDoc = await getDoc(doc(db, 'eventos', id));
        if (eventoDoc.exists()) {
          const eventoData = eventoDoc.data();
          setNome(eventoData.nome);
          setData(eventoData.data);
          setLocal(eventoData.local);
          setImageUrl(eventoData.imageUrl || '');
        }
      } catch (error) {
        Alert.alert("Erro", "Erro ao carregar evento. Verifique a conexão.");
        console.error("Erro ao carregar evento: ", error);
      }
    };

    carregarEvento();
  }, [id]);

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

  const atualizarEvento = async () => {
    try {
      let updatedImageUrl = imageUrl;

      if (image) {
        const imageRef = ref(storage, `eventos/${nome}_${Date.now()}.jpg`);
        const img = await fetch(image);
        const bytes = await img.blob();
        await uploadBytes(imageRef, bytes);
        updatedImageUrl = await getDownloadURL(imageRef);
      }

      await updateDoc(doc(db, 'eventos', id), {
        nome,
        data,
        local,
        imageUrl: updatedImageUrl,
      });
      Alert.alert('Sucesso', 'Evento atualizado com sucesso!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Erro ao atualizar evento. Verifique as permissões de acesso ao Firebase.');
      console.error('Erro ao atualizar evento:', error);
    }
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
      {imageUrl && <Image source={{ uri: imageUrl }} style={styles.image} />}
      {image && <Image source={{ uri: image }} style={styles.image} />}
      <Button title="Salvar Alterações" onPress={atualizarEvento} />
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default EditarEvento;