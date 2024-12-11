import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebaseConfig';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

const CadProduto = () => {
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [dataValidade, setDataValidade] = useState('');
  const [descricao, setDescricao] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'createItem'>>();

  const categorias = [
    { label: 'Ração', value: 'Ração' },
    { label: 'Medicamentos', value: 'Medicamentos' },
    { label: 'Brinquedos', value: 'Brinquedos' },
    { label: 'Produtos de Higiene', value: 'Produtos de Higiene' },
    { label: 'Acessórios', value: 'Acessórios' },
  ];

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

  const cadastrarProduto = async () => {
    if (!nome || !categoria || !quantidade || !dataValidade) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const dataAtual = new Date();
    const [dia, mes, ano] = dataValidade.split('/').map(Number);
    const dataSelecionada = new Date(ano, mes - 1, dia);

    if (
      isNaN(dataSelecionada.getTime()) ||
      dataSelecionada < dataAtual
    ) {
      Alert.alert('Erro', 'Por favor, insira uma data válida no futuro.');
      return;
    }

    setUploading(true);

    try {
      let imageUrl = '';

      if (image) {
        const imageRef = ref(storage, `produtos/${nome}_${Date.now()}.jpg`);
        const img = await fetch(image);
        const bytes = await img.blob();
        await uploadBytes(imageRef, bytes);
        imageUrl = await getDownloadURL(imageRef);
      }

      await addDoc(collection(db, 'produtos'), {
        nome,
        categoria,
        quantidade: parseInt(quantidade),
        dataValidade,
        descricao,
        imageUrl,
      });

      Alert.alert('Sucesso', 'Produto cadastrado com sucesso!');
      setNome('');
      setCategoria('');
      setQuantidade('');
      setDataValidade('');
      setDescricao('');
      setImage(null);
      navigation.navigate('listItem');
    } catch (error) {
      Alert.alert('Erro', 'Erro ao cadastrar produto. Verifique a conexão.');
      console.error('Erro ao cadastrar produto:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Cadastro de Produto</Text>

        <Text style={styles.label}>Nome do Produto*</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite o nome do produto"
          value={nome}
          onChangeText={setNome}
        />

        <Picker
          selectedValue={categoria}
          onValueChange={(itemValue) => setCategoria(itemValue)}
          style={styles.input}
        >
          <Picker.Item label="Selecione uma categoria" value="" />
          {categorias.map((cat, index) => (
            <Picker.Item key={index} label={cat.label} value={cat.value} />
          ))}
        </Picker>

        <Text style={styles.label}>Quantidade*</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite a quantidade disponível"
          value={quantidade}
          onChangeText={setQuantidade}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="DD/MM/AAAA"
          value={dataValidade}
          keyboardType="numeric"
          maxLength={10}
          onChangeText={(text) => {
            let formatted = text.replace(/\D/g, '');
            if (formatted.length > 2) {
              formatted = `${formatted.slice(0, 2)}/${formatted.slice(2)}`;
            }
            if (formatted.length > 5) {
              formatted = `${formatted.slice(0, 5)}/${formatted.slice(5)}`;
            }
            setDataValidade(formatted);
          }}
        />

        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Digite uma descrição do produto"
          value={descricao}
          onChangeText={setDescricao}
          multiline
        />

        <TouchableOpacity onPress={pickImage} style={styles.button}>
          <Text style={styles.buttonText}>Selecionar Imagem</Text>
        </TouchableOpacity>
        {image && <Image source={{ uri: image }} style={styles.image} />}
      </ScrollView>

      <View style={styles.fixedButtonsContainer}>
        <TouchableOpacity style={styles.registerButton} onPress={cadastrarProduto}>
          <Text style={styles.registerButtonText}>Cadastrar Produto</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('listItem')}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Espaço extra para evitar sobreposição
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    height: 60,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#4caf50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  image: {
    width: 100,
    height: 100,
    marginVertical: 10,
    borderRadius: 8,
  },
  fixedButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
  },
  registerButton: {
    backgroundColor: '#007bff',
    borderRadius: 50,
    paddingVertical: 15,
    paddingHorizontal: 20,
    elevation: 5,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#ff4444',
    borderRadius: 50,
    paddingVertical: 15,
    paddingHorizontal: 20,
    elevation: 5,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CadProduto;