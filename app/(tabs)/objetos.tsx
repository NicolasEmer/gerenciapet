import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, TextInput, Button, Alert, FlatList, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebaseConfig'; // Importa a configuração Firebase

const Objetos: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [objectName, setObjectName] = useState('');
  const [objectDescription, setObjectDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [objects, setObjects] = useState<any[]>([]);
  const [editingObject, setEditingObject] = useState<any>(null);
  const [viewingObject, setViewingObject] = useState<any>(null);

  useEffect(() => {
    fetchObjects();
  }, []);

  const fetchObjects = async () => {
    const querySnapshot = await getDocs(collection(db, 'objects'));
    const fetchedObjects = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    setObjects(fetchedObjects);
  };

  const handleAddOrUpdateObject = async () => {
    if (!objectName || !objectDescription) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    let imageUrl = '';
    if (image) {
      const imageRef = ref(storage, `images/${objectName}_${Date.now()}.jpg`);
      const img = await fetch(image);
      const bytes = await img.blob();
      await uploadBytes(imageRef, bytes);
      imageUrl = await getDownloadURL(imageRef);
    }

    const objectData = {
      name: objectName,
      description: objectDescription,
      image: imageUrl,
    };

    if (editingObject) {
      const objectRef = doc(db, 'objects', editingObject.id);
      await updateDoc(objectRef, objectData);
      Alert.alert('Sucesso', 'Objeto atualizado com sucesso!');
    } else {
      await addDoc(collection(db, 'objects'), objectData);
      Alert.alert('Sucesso', 'Objeto adicionado com sucesso!');
    }

    setModalVisible(false);
    setObjectName('');
    setObjectDescription('');
    setImage(null);
    setEditingObject(null);
    fetchObjects(); 
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

  const handleEditObject = (object: any) => {
    setEditingObject(object);
    setObjectName(object.name);
    setObjectDescription(object.description);
    setImage(object.image);
    setModalVisible(true);
  };

  const handleDeleteObject = async (id: string) => {
    await deleteDoc(doc(db, 'objects', id));
    Alert.alert('Sucesso', 'Objeto deletado com sucesso!');
    fetchObjects(); 
  };

  const handleViewObject = (object: any) => {
    setViewingObject(object);
    setViewModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Adicionando imagem no topo */}
      <Image source={require('../../assets/images/doacoes.png')} style={styles.topImage} />

      {/* Lista rolável de objetos */}
      <FlatList
        data={objects}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.methodContainer}>
            <TouchableOpacity onPress={() => handleViewObject(item)}>
              <Image source={{ uri: item.image }} style={styles.qrImage} />
            </TouchableOpacity>
            <Text style={styles.methodName}>{item.name}</Text>
            <Text style={styles.methodDescription}>{item.description}</Text>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity onPress={() => handleEditObject(item)} style={styles.editButton}>
                <Text style={styles.editButtonText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteObject(item.id)} style={styles.deleteButton}>
                <Text style={styles.deleteButtonText}>Deletar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListFooterComponent={
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.addButtonText}>Adicionar Objeto</Text>
          </TouchableOpacity>
        }
      />

      {/* Modal para visualizar objeto */}
      <Modal animationType="slide" transparent={true} visible={viewModalVisible} onRequestClose={() => setViewModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {viewingObject && (
              <>
                <Image source={{ uri: viewingObject.image }} style={styles.expandedImage} />
                <Text style={styles.modalTitle}>{viewingObject.name}</Text>
                <Text style={styles.methodDescription}>{viewingObject.description}</Text>
              </>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={() => setViewModalVisible(false)}>
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal para adicionar ou editar objeto */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingObject ? 'Editar Objeto' : 'Novo Objeto'}</Text>

            <TextInput
              style={styles.input}
              placeholder="Nome do Objeto"
              value={objectName}
              onChangeText={setObjectName}
            />

            <TextInput
              style={styles.input}
              placeholder="Descrição do Objeto"
              value={objectDescription}
              onChangeText={setObjectDescription}
            />

            <Button title="Selecionar Imagem" onPress={pickImage} />
            {image && <Image source={{ uri: image }} style={styles.selectedImage} />}

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddOrUpdateObject}>
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

export default Objetos;
