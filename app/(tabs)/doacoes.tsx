import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, TextInput, Button, Alert, FlatList, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebaseConfig'; // Importa a configuração Firebase
import navigation, { RootStackParamList } from '../navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from 'expo-router';

const doacoes: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [paymentMethodName, setPaymentMethodName] = useState('');
  const [paymentMethodDescription, setPaymentMethodDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [editingMethod, setEditingMethod] = useState<any>(null);
  const [viewingMethod, setViewingMethod] = useState<any>(null);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'doacoes'>>();

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    const querySnapshot = await getDocs(collection(db, 'paymentMethods'));
    const methods = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    setPaymentMethods(methods);
  };

  const handleAddOrUpdatePaymentMethod = async () => {
    if (!paymentMethodName || !paymentMethodDescription) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    let imageUrl = '';
    if (image) {
      const imageRef = ref(storage, `images/${paymentMethodName}_${Date.now()}.jpg`);
      const img = await fetch(image);
      const bytes = await img.blob();
      await uploadBytes(imageRef, bytes);
      imageUrl = await getDownloadURL(imageRef);
    }

    const methodData = {
      name: paymentMethodName,
      description: paymentMethodDescription,
      image: imageUrl,
    };

    if (editingMethod) {
      const methodRef = doc(db, 'paymentMethods', editingMethod.id);
      await updateDoc(methodRef, methodData);
      Alert.alert('Sucesso', 'Método atualizado com sucesso!');
    } else {
      await addDoc(collection(db, 'paymentMethods'), methodData);
      Alert.alert('Sucesso', 'Método adicionado com sucesso!');
    }

    setModalVisible(false);
    setPaymentMethodName('');
    setPaymentMethodDescription('');
    setImage(null);
    setEditingMethod(null);
    fetchPaymentMethods(); 
  };

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

  const handleEditMethod = (method: any) => {
    setEditingMethod(method);
    setPaymentMethodName(method.name);
    setPaymentMethodDescription(method.description);
    setImage(method.image);
    setModalVisible(true);
  };

  const handleDeleteMethod = async (id: string) => {
    await deleteDoc(doc(db, 'paymentMethods', id));
    Alert.alert('Sucesso', 'Método deletado com sucesso!');
    fetchPaymentMethods(); 
  };

  const handleViewMethod = (method: any) => {
    setViewingMethod(method);
    setViewModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Adicionando imagem no topo */}
      <Image source={require('../../assets/images/doacoes.png')} style={styles.topImage} />

      {/* Lista rolável de métodos de pagamento */}
      <FlatList
        data={paymentMethods}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.methodContainer}>
            <TouchableOpacity onPress={() => handleViewMethod(item)}>
              <Image source={{ uri: item.image }} style={styles.qrImage} />
            </TouchableOpacity>
            <Text style={styles.methodName}>{item.name}</Text>
            <Text style={styles.methodDescription}>{item.description}</Text>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity onPress={() => handleEditMethod(item)} style={styles.editButton}>
                <Text style={styles.editButtonText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteMethod(item.id)} style={styles.deleteButton}>
                <Text style={styles.deleteButtonText}>Deletar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListFooterComponent={
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.addButtonText}>Adicionar Meio de Doação</Text>
          </TouchableOpacity>        
        }
      />
    <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
      <Text style={styles.backButtonText}>Voltar</Text>
    </TouchableOpacity>
      {/* Modal para visualizar método de pagamento */}
      <Modal animationType="slide" transparent={true} visible={viewModalVisible} onRequestClose={() => setViewModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {viewingMethod && (
              <>
                <Image source={{ uri: viewingMethod.image }} style={styles.expandedImage} />
                <Text style={styles.modalTitle}>{viewingMethod.name}</Text>
                <Text style={styles.methodDescription}>{viewingMethod.description}</Text>
              </>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={() => setViewModalVisible(false)}>
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal para adicionar ou editar método de pagamento */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingMethod ? 'Editar Método de Doação' : 'Novo Método de Doação'}</Text>

            <TextInput
              style={styles.input}
              placeholder="Nome do Método"
              value={paymentMethodName}
              onChangeText={setPaymentMethodName}
            />

            <TextInput
              style={styles.input}
              placeholder="Descrição do Método"
              value={paymentMethodDescription}
              onChangeText={setPaymentMethodDescription}
            />

            <Button title="Selecionar Imagem" onPress={pickImage} />
            {image && <Image source={{ uri: image }} style={styles.selectedImage} />}

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddOrUpdatePaymentMethod}>
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>

              <View style={styles.buttonSpacing} />

              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
  },
  topImage: {
    width: '90%',
    height: 250,
    resizeMode: 'contain',
    marginBottom: 10,
    marginTop:50,
  },
  methodContainer: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    marginVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  qrImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
    borderRadius: 8,
  },
  methodName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  methodDescription: {
    fontSize: 14,
    color: '#777',
    marginBottom: 10,
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  editButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 20,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  selectedImage: {
    width: 100,
    height: 100,
    marginVertical: 10,
    borderRadius: 8,
  },
  expandedImage: {
    width: 250,
    height: 250,
    marginBottom: 20,
    borderRadius: 8,
  },
  closeButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    width: '100%',
  },
  saveButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  buttonSpacing: {
    width: 10, // Espaço entre os botões
  },
});

export default doacoes;

