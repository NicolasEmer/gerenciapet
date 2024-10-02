import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';

interface Animal {
  id: string;
  name: string;
  type: string;
  image: string;
  description: string;
}

export default function AnimalListScreen() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);

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
    setModalVisible(true);
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

      {/* Modal de visualização de animal */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedAnimal && (
              <>
                <Image source={{ uri: selectedAnimal.image }} style={styles.expandedImage} />
                <Text style={styles.modalTitle}>{selectedAnimal.name}</Text>
                <Text style={styles.modalType}>{selectedAnimal.type}</Text>
                <Text style={styles.modalDescription}>{selectedAnimal.description}</Text>
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
  },
  listContainer: {
    paddingBottom: 20,
  },
  animalContainer: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    marginVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  animalImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
    borderRadius: 8,
  },
  animalName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  animalType: {
    fontSize: 14,
    color: '#777',
    marginBottom: 10,
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
  expandedImage: {
    width: 250,
    height: 250,
    marginBottom: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalType: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 14,
    color: '#777',
    marginBottom: 20,
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
});
