import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, Image, TouchableOpacity, Modal, ActivityIndicator, ScrollView } from 'react-native';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../config/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Home from './Home';

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
  size: string;
}

export default function AnimalListScreen() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [updatedAnimal, setUpdatedAnimal] = useState<Partial<Animal>>({});
  const [image, setImage] = useState<string | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'listAnimais'>>();

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

  const handleRegisterAnimal = () => {
    // Lógica para cadastrar animal (navegar para nova tela ou abrir modal).
    navigation.navigate('createAnimais'); // Certifique-se de que essa tela está configurada.
  };

  const renderItem = ({ item }: { item: Animal }) => (
    <TouchableOpacity style={styles.animalContainer} onPress={() => handleViewAnimal(item)}>
      <Image source={{ uri: item.image }} style={styles.animalImage} />
      <View style={styles.animalInfo}>
        <Text style={styles.animalName}>{item.name}</Text>
        <Text style={styles.animalType}>{item.type}</Text>
        <Text style={styles.animalSize}>Porte: {item.size}</Text>
      </View>
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
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
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
                  <Text>Porte: {selectedAnimal.size}</Text>

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
                  <Text style={styles.label}>Porte</Text>
                  <Picker
                    selectedValue={updatedAnimal.size || selectedAnimal.size}
                    onValueChange={(itemValue) => setUpdatedAnimal({ ...updatedAnimal, size: itemValue })}
                    style={styles.picker}
                  >
                    <Picker.Item label="Pequeno" value="pequeno" />
                    <Picker.Item label="Médio" value="médio" />
                    <Picker.Item label="Grande" value="grande" />
                  </Picker>

                  <TextInput
                    style={[styles.input, { height: 100 }]}
                    placeholder="Descrição"
                    value={updatedAnimal.description}
                    onChangeText={(text) => setUpdatedAnimal({ ...updatedAnimal, description: text })}
                    multiline={true}
                    numberOfLines={4}
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

                  <Picker
                    selectedValue={updatedAnimal.adoptionStatus}
                    onValueChange={(itemValue) =>
                      setUpdatedAnimal({ ...updatedAnimal, adoptionStatus: itemValue })
                    }
                    style={styles.picker}
                  >
                    <Picker.Item label="Disponível" value="Disponível" />
                    <Picker.Item label="Indisponível" value="Indisponível" />
                  </Picker>

                  <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
                    <Text style={styles.saveButtonText}>Salvar</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
            <Button title="Fechar" onPress={() => setModalVisible(false)} /> 
          </View>
        </View>
      </Modal>
      <TouchableOpacity style={styles.registerButton} onPress={handleRegisterAnimal}>
        <Text style={styles.registerButtonText}>Cadastrar Animal</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>          
    </View>
  );
}

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
    backgroundColor: '#f9f9f9',
    paddingTop: 20,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
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
    marginRight: 10,
  },
  animalInfo: {
    flex: 1,
  },
  animalName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  animalType: {
    fontSize: 14,
    color: '#666',
  },
  animalSize: {
    fontSize: 14,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  scrollViewContent: {
    paddingBottom: 20,
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
    marginBottom: 8,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  picker: {
    height:55,
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 8,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
  },
  buttonText: {
    color: '#007bff',
    fontSize: 16,
    marginTop: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  checked: {
    marginLeft: 10,
    color: 'green',
    fontWeight: 'bold',
  },
  unchecked: {
    marginLeft: 10,
    color: 'red',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

