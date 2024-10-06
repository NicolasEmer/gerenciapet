import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, Image, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../config/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';

interface Animal {
  id: string;
  name: string;
  type: string;
  breed: string;
  gender: string;
  age: string;
  isVaccinated: boolean;
  isCastrated: boolean;
  description: string;
  adoptionStatus: string;
  image: string;
}

export default function AnimalListScreen() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [updatedAnimal, setUpdatedAnimal] = useState<Partial<Animal>>({});
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    fetchAnimals();
  }, []);

  const fetchAnimals = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'animals'));
      const animalList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Animal[];
      setAnimals(animalList);
    } catch (error) {
      console.error('Erro ao buscar animais:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAnimal = (animal: Animal) => {
    setSelectedAnimal(animal);
    setUpdatedAnimal(animal);
    setImage(animal.image);
    setModalVisible(true);
    setEditMode(false);
  };

  const handleDeleteAnimal = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'animals', id));
      setAnimals(animals.filter((animal) => animal.id !== id));
      setModalVisible(false);
    } catch (error) {
      console.error('Erro ao deletar animal:', error);
    }
  };

  const handleEditAnimal = () => {
    setEditMode(true);
  };

  const handleSaveEdit = async () => {
    if (selectedAnimal && updatedAnimal) {
      try {
        let imageUrl = selectedAnimal.image;
        if (image && image !== selectedAnimal.image) {
          const imageRef = ref(storage, `animals/${selectedAnimal.name}_${Date.now()}.jpg`);
          const img = await fetch(image);
          const bytes = await img.blob();
          await uploadBytes(imageRef, bytes);
          imageUrl = await getDownloadURL(imageRef);
        }

        const animalRef = doc(db, 'animals', selectedAnimal.id);
        await updateDoc(animalRef, { ...updatedAnimal, image: imageUrl });
        fetchAnimals();
        setModalVisible(false);
      } catch (error) {
        console.error('Erro ao atualizar animal:', error);
      }
    }
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

  const renderItem = ({ item }: { item: Animal }) => (
    <TouchableOpacity style={styles.animalContainer} onPress={() => handleViewAnimal(item)}>
      <Image source={{ uri: item.image }} style={styles.animalImage} />
      <Text style={styles.animalName}>{item.name}</Text>
      <Text style={styles.animalType}>{item.type}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={animals}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedAnimal && !editMode && (
              <>
                <Image source={{ uri: selectedAnimal.image }} style={styles.expandedImage} />
                <Text style={styles.modalTitle}>{selectedAnimal.name}</Text>
                <Text style={styles.modalType}>{selectedAnimal.type}</Text>
                <Text style={styles.modalDescription}>{selectedAnimal.description}</Text>
                <Text>Raça: {selectedAnimal.breed}</Text>
                <Text>Gênero: {selectedAnimal.gender}</Text>
                <Text>Idade: {selectedAnimal.age}</Text>
                <Text>Vacinação: {selectedAnimal.isVaccinated ? 'Sim' : 'Não'}</Text>
                <Text>Castração: {selectedAnimal.isCastrated ? 'Sim' : 'Não'}</Text>
                <Text>Status de adoção: {selectedAnimal.adoptionStatus}</Text>

                <TouchableOpacity style={styles.editButton} onPress={handleEditAnimal}>
                  <Text style={styles.editButtonText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteAnimal(selectedAnimal.id)}>
                  <Text style={styles.deleteButtonText}>Deletar</Text>
                </TouchableOpacity>
              </>
            )}

            {selectedAnimal && editMode && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Nome do Animal"
                  value={updatedAnimal.name}
                  onChangeText={(text) => setUpdatedAnimal({ ...updatedAnimal, name: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Tipo do Animal"
                  value={updatedAnimal.type}
                  onChangeText={(text) => setUpdatedAnimal({ ...updatedAnimal, type: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Raça"
                  value={updatedAnimal.breed}
                  onChangeText={(text) => setUpdatedAnimal({ ...updatedAnimal, breed: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Gênero"
                  value={updatedAnimal.gender}
                  onChangeText={(text) => setUpdatedAnimal({ ...updatedAnimal, gender: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Idade"
                  value={updatedAnimal.age}
                  onChangeText={(text) => setUpdatedAnimal({ ...updatedAnimal, age: text })}
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Descrição"
                  value={updatedAnimal.description}
                  onChangeText={(text) => setUpdatedAnimal({ ...updatedAnimal, description: text })}
                />

                <TouchableOpacity onPress={pickImage}>
                  <Text style={styles.buttonText}>Selecionar Imagem</Text>
                </TouchableOpacity>
                {image && <Image source={{ uri: image }} style={styles.image} />}

                <View style={styles.checkboxContainer}>
                  <Text>Vacinação:</Text>
                  <TouchableOpacity onPress={() => setUpdatedAnimal({ ...updatedAnimal, isVaccinated: !updatedAnimal.isVaccinated })}>
                    <Text style={updatedAnimal.isVaccinated ? styles.checked : styles.unchecked}>
                      {updatedAnimal.isVaccinated ? 'Sim' : 'Não'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.checkboxContainer}>
                  <Text>Castração:</Text>
                  <TouchableOpacity onPress={() => setUpdatedAnimal({ ...updatedAnimal, isCastrated: !updatedAnimal.isCastrated })}>
                    <Text style={updatedAnimal.isCastrated ? styles.checked : styles.unchecked}>
                      {updatedAnimal.isCastrated ? 'Sim' : 'Não'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Status de Adoção"
                  value={updatedAnimal.adoptionStatus}
                  onChangeText={(text) => setUpdatedAnimal({ ...updatedAnimal, adoptionStatus: text })}
                />

                <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
                  <Text style={styles.saveButtonText}>Salvar</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    paddingTop: 20,  // Adicionado para mover a lista um pouco mais para baixo
  },
  listContainer: {
    paddingHorizontal: 16,
    marginTop: 20, // Aumentando o espaçamento para que os itens da lista fiquem mais abaixo
  },
  animalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  animalImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  animalName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  animalType: {
    fontSize: 16,
    color: '#777',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '85%', // Diminuímos o tamanho do modal para 85% da largura da tela
    height: '85%', // Diminuímos o tamanho do modal para 85% da altura da tela
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  expandedImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalType: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  modalDescription: {
    fontSize: 16,
    marginBottom: 10,
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
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  editButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  editButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    padding: 10,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#888',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

