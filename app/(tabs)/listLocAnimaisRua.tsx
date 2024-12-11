import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Button,
} from 'react-native';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import * as ImagePicker from 'expo-image-picker';

interface Location {
  id: string;
  type: string;
  breed: string;
  color: string;
  description: string;
  image: string;
  location: {
    latitude: number;
    longitude: number;
  };
  reportedAt: string;
}

const LocationListScreen = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [mapVisible, setMapVisible] = useState(false);
  const [tempMapRegion, setTempMapRegion] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'listLocAnimaisRua'>>();

  const [editType, setEditType] = useState('');
  const [editBreed, setEditBreed] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImage, setEditImage] = useState('');

  useEffect(() => {
    fetchLocations();
  }, []);
  
  const fetchLocations = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'reportedAnimals'));
      const locationList = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          type: data.type || 'Desconhecido',
          breed: data.breed || 'Desconhecida',
          color: data.color || 'Não especificada',
          description: data.description || 'Sem descrição',
          image: data.image || '',
          location: data.location || null,
          reportedAt: data.reportedAt?.toDate
            ? data.reportedAt.toDate().toLocaleDateString()
            : 'Data inválida',
        };
      }) as Location[];
      setLocations(locationList);
    } catch (error) {
      console.error('Erro ao buscar localizações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    // Solicita permissão para acessar a galeria
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      alert('Permissão para acessar a galeria é necessária!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
  
    if (!result.canceled && result.assets) {
      setEditImage(result.assets[0].uri);
    }
  };

  const handleViewLocation = (location: Location) => {
    setSelectedLocation(location);
    setTempMapRegion({
      latitude: location.location?.latitude || 0,
      longitude: location.location?.longitude || 0,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    setEditType(location.type);
    setEditBreed(location.breed);
    setEditColor(location.color);
    setEditImage(location.image);
    setEditDescription(location.description);
    setModalVisible(true);
  };


  const handleMapPress = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setTempMapRegion({ ...tempMapRegion, latitude, longitude });
  };

  const handleRegistration = () => {
    // Lógica para cadastrar animal (navegar para nova tela ou abrir modal).
    navigation.navigate('createLocAnimaisRua'); // Certifique-se de que essa tela está configurada.
  };

  const renderItem = ({ item }: { item: Location }) => (
    <TouchableOpacity style={styles.locationContainer} onPress={() => handleViewLocation(item)}>
      <Image source={{ uri: item.image }} style={styles.locationImage} />
      <View style={styles.locationInfo}>
        <Text style={styles.locationType}>{item.type}</Text>
        <Text style={styles.locationDate}>Data: {item.reportedAt}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={locations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.modalContent}>


            <Text style={styles.modalTitle}>Edição</Text>

            {editImage ? (
              <>
                <Image source={{ uri: editImage }} style={styles.modalImagePreview} />
              </>
            ) : (
              <Text style={styles.noImageText}>Nenhuma imagem disponível</Text>
            )}
              <TouchableOpacity style={styles.openMapButton} onPress={handlePickImage}>
                <Text style={styles.buttonText}>Selecionar Imagem</Text>
              </TouchableOpacity>

            <Text style={styles.modalText}>Tipo:</Text>
            <TextInput
              style={styles.input}
              value={editType}
              onChangeText={setEditType}
            />

            <Text style={styles.modalText}>Raça:</Text>
            <TextInput
              style={styles.input}
              value={editBreed}
              onChangeText={setEditBreed}
            />

            <Text style={styles.modalText}>Cor:</Text>
            <TextInput
              style={styles.input}
              value={editColor}
              onChangeText={setEditColor}
            />

            <Text style={styles.modalText}>Descrição:</Text>
            <TextInput
              style={styles.input}
              value={editDescription}
              onChangeText={setEditDescription}
              multiline
            />

            <TouchableOpacity
              style={styles.openMapButton}
              onPress={() => {
                if (selectedLocation?.location) {
                  setTempMapRegion({
                    latitude: selectedLocation.location.latitude,
                    longitude: selectedLocation.location.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  });
                }
                setMapVisible(true);
              }}
            >
              <Text style={styles.buttonText}>Atualizar/Ver Localização</Text>
            </TouchableOpacity>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={async () => {
                  if (selectedLocation) {
                    try {
                      await updateDoc(doc(db, 'reportedAnimals', selectedLocation.id), {
                        type: editType,
                        breed: editBreed,
                        color: editColor,
                        description: editDescription,
                        image: editImage,
                        location: {
                          latitude: tempMapRegion.latitude,
                          longitude: tempMapRegion.longitude,
                        },
                      });
                      fetchLocations();
                      setModalVisible(false);
                    } catch (error) {
                      console.error('Erro ao salvar alterações:', error);
                    }
                  }
                }}
              >
                <Text style={styles.buttonText}>Salvar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        <Modal
          visible={mapVisible}
          animationType="slide"
          onRequestClose={() => setMapVisible(false)}
        >
          <MapView
          style={styles.map}
          region={tempMapRegion}
          initialRegion={{
            latitude: tempMapRegion.latitude || 0,
            longitude: tempMapRegion.longitude || 0,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          onPress={handleMapPress}>

          <Marker
            coordinate={tempMapRegion}
          />
        </MapView>

          <View style={styles.mapActions}>
            <Button
              title="Confirmar Localização"
              onPress={() => setMapVisible(false)}
            />
            <Button
              title="Cancelar"
              onPress={() => setMapVisible(false)}
            />
          </View>
        </Modal>
      </Modal>
      <View style={styles.fixedButtonsContainer}>
      <TouchableOpacity style={styles.registerButton} onPress={handleRegistration}>
        <Text style={styles.registerButtonText}>Informar Animal</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
      </View>   
    </View>
  );
}
const styles = StyleSheet.create({
  fixedButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
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
    backgroundColor: '#f0f0f5',
    padding: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  editLocationButton: {
    backgroundColor: '#2196f3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  mapActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#fff',
  },
  modalImagePreview: {
    width: 300,
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#e0e0e0',
  },  
  noImageText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  locationImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: '#e0e0e0',
  },
  locationInfo: {
    flex: 1,
  },
  locationType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  locationDate: {
    fontSize: 14,
    color: '#666',
  },
  openMapButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  map: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  saveButton: {
    backgroundColor: '#4caf50',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#2196f3',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#e53935',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    marginLeft: 8,
  },
  closeButton: {
    backgroundColor: '#9e9e9e',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default LocationListScreen;