import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert, TouchableOpacity, Image, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';


const ListarProduto = () => {
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [dataValidade, setDataValidade] = useState('');
  const [descricao, setDescricao] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [produtoId, setProdutoId] = useState<string | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'listItem'>>();

  const categorias = [
    { label: 'Ração', value: 'Ração' },
    { label: 'Medicamentos', value: 'Medicamentos' },
    { label: 'Brinquedos', value: 'Brinquedos' },
    { label: 'Produtos de Higiene', value: 'Produtos de Higiene' },
    { label: 'Acessórios', value: 'Acessórios' },
  ];

  useFocusEffect(
    React.useCallback(() => {
      listarProdutos();
    }, []) 
  );

  const listarProdutos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'produtos'));
      const produtosLista = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProdutos(produtosLista);
    } catch (error) {
      console.error('Erro ao listar produtos:', error);
    }
  };

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

      if (produtoId) {
        // Atualizar produto existente
        const produtoRef = doc(db, 'produtos', produtoId);
        await updateDoc(produtoRef, {
          nome,
          categoria,
          quantidade: parseInt(quantidade),
          dataValidade,
          descricao,
          imageUrl,
        });
        Alert.alert('Sucesso', 'Produto atualizado com sucesso!');
      } else {
        // Cadastrar novo produto
        await addDoc(collection(db, 'produtos'), {
          nome,
          categoria,
          quantidade: parseInt(quantidade),
          dataValidade,
          descricao,
          imageUrl,
        });
        Alert.alert('Sucesso', 'Produto cadastrado com sucesso!');
      }

      // Limpar o formulário e recarregar lista
      limparFormulario();
      listarProdutos();
    } catch (error) {
      Alert.alert('Erro', 'Erro ao cadastrar ou atualizar produto. Verifique a conexão.');
      console.error('Erro ao cadastrar/atualizar produto:', error);
    } finally {
      setUploading(false);
    }
  };

  const editarProduto = (produto: any) => {
    setNome(produto.nome);
    setCategoria(produto.categoria);
    setQuantidade(produto.quantidade.toString());
    setDataValidade(produto.dataValidade);
    setDescricao(produto.descricao);
    setImage(produto.imageUrl);
    setProdutoId(produto.id);
    setModalVisible(true);
  };

  const excluirProduto = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'produtos', id));
      Alert.alert('Sucesso', 'Produto excluído com sucesso!');
      listarProdutos();
    } catch (error) {
      Alert.alert('Erro', 'Erro ao excluir produto.');
      console.error('Erro ao excluir produto:', error);
    }
  };

  const handleRegisterItem = () => {
    navigation.navigate('createItem'); // Certifique-se de que essa tela está configurada.
  };

  const limparFormulario = () => {
    setNome('');
    setCategoria('');
    setQuantidade('');
    setDataValidade('');
    setDescricao('');
    setImage(null);
    setProdutoId(null);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.produtosList}>
          {produtos.map((produto) => (
            <View key={produto.id} style={styles.produtoCard}>
              <Image source={{ uri: produto.imageUrl }} style={styles.produtoImage} />
              <View style={styles.produtoDetails}>
                <Text style={styles.produtoNome}>{produto.nome}</Text>
                <Text style={styles.produtoCategoria}>{produto.categoria}</Text>
                <Text style={styles.produtoQuantidade}>Qtd: {produto.quantidade}</Text>
                <View style={styles.actions}>
                  <Button title="Editar" onPress={() => editarProduto(produto)} />
                  <Button title="Excluir" onPress={() => excluirProduto(produto.id)} />
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={false} // Modal não transparente
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <Text style={styles.label}>Nome do Produto*</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o nome do produto"
              value={nome}
              onChangeText={setNome}
            />

            <Text style={styles.label}>Categoria*</Text>
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

            <Text style={styles.label}>Data de Validade*</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 10/12/2024"
              value={dataValidade}
              onChangeText={setDataValidade}
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

            <View style={styles.buttonContainer}>
                <Button title={uploading ? 'Salvando...' : 'Salvar'} onPress={cadastrarProduto} disabled={uploading} />
                <Button title="Cancelar" onPress={() => limparFormulario()} />
            </View>

          </ScrollView>
        </View>
      </Modal>
      <TouchableOpacity style={styles.registerButton} onPress={handleRegisterItem}>
        <Text style={styles.registerButtonText}>Cadastrar Item</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({

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

  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
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
    marginHorizontal: 5,
  },
  picker: {
    backgroundColor: '#ffffff', // Fundo branco
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    marginBottom: 15,
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
  produtosList: {
    marginTop: 20,
  },
  produtoCard: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  produtoImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  produtoDetails: {
    flex: 1,
    marginLeft: 10,
  },
  produtoNome: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  produtoCategoria: {
    fontSize: 14,
    color: '#666',
  },
  produtoQuantidade: {
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // Alterado para fundo branco
    padding: 20,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
});

export default ListarProduto;
