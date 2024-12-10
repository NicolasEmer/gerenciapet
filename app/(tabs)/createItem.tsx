import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebaseConfig';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
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
      setImage(result.assets[0].uri); // Define a URI da nova imagem temporariamente
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
      isNaN(dataSelecionada.getTime()) || // Verifica se é uma data inválida
      dataSelecionada < dataAtual // Verifica se a data é anterior à atual
    ) {
      Alert.alert('Erro', 'Por favor, insira uma data válida no futuro.');
      return;
    }

    setUploading(true);

    try {
      let imageUrl = '';

      // Upload da imagem
      if (image) {
        const imageRef = ref(storage, `produtos/${nome}_${Date.now()}.jpg`);
        const img = await fetch(image);
        const bytes = await img.blob();
        await uploadBytes(imageRef, bytes);
        imageUrl = await getDownloadURL(imageRef);
      }

      // Cadastrar o produto no Firestore
      await addDoc(collection(db, 'produtos'), {
        nome,
        categoria,
        quantidade: parseInt(quantidade),
        dataValidade,
        descricao,
        imageUrl,
      });

      Alert.alert('Sucesso', 'Produto cadastrado com sucesso!');
      // Limpar o formulário
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
    <ScrollView style={styles.container}>
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
        keyboardType="numeric" // Garante que o teclado numérico seja utilizado
        maxLength={10} // Limita a entrada a 10 caracteres (formato DD/MM/AAAA)
        onChangeText={(text) => {
          let formatted = text.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
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

      <Button title={uploading ? 'Cadastrando...' : 'Cadastrar Produto'} onPress={cadastrarProduto} disabled={uploading} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
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
  picker: {
    backgroundColor: '#ffffff', // Fundo branco
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    marginBottom: 15,
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
});

export default CadProduto;
