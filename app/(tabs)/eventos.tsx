import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, Image, FlatList, TouchableOpacity, Button, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';

interface Evento {
  id: string;
  nome: string;
  data: string;
  local: string;
  imageUrl?: string;
}

const Eventos = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'eventos'>>();

  const carregarEventos = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'eventos'));
      if (querySnapshot.empty) {
        Alert.alert("Aviso", "Nenhum evento encontrado.");
        setLoading(false);
        return;
      }

      const eventosList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Evento[];

      setEventos(eventosList);
      setLoading(false);
    } catch (error) {
      Alert.alert("Erro", "Erro ao carregar eventos. Verifique a conexão.");
      console.error("Erro ao carregar eventos: ", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarEventos(); // Carregar eventos na primeira renderização
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarEventos(); // Carregar eventos sempre que a tela ganhar foco
    }, [])
  );

  const excluirEvento = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'eventos', id));
      setEventos(eventos.filter(evento => evento.id !== id));
      Alert.alert("Sucesso", "Evento excluído com sucesso.");
    } catch (error) {
      Alert.alert("Erro", "Erro ao excluir evento. Verifique a conexão.");
      console.error("Erro ao excluir evento: ", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Eventos</Text>
      {loading ? (
        <Text style={styles.loadingText}>Carregando eventos...</Text>
      ) : (
        <FlatList
          data={eventos}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.eventItem}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.imageBox} />
              ) : (
                <Image
                  source={{ uri: 'https://via.placeholder.com/150.png?text=Sem+Imagem' }}
                  style={styles.imageBox}
                />
              )}

              <View style={styles.eventInfo}>
                <Text style={styles.eventText}>Nome: {item.nome}</Text>
                <Text style={styles.eventText}>Data: {item.data}</Text>
                <Text style={styles.eventText}>Local: {item.local}</Text>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => navigation.navigate('EditarEvento', { id: item.id })}
                  >
                    <Text style={styles.buttonText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => excluirEvento(item.id)}
                  >
                    <Text style={styles.buttonText}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
      <View style={styles.fixedButtonsContainer}>
      <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate('AdicionarEvento')}>
        <Text style={styles.registerButtonText}>Adicionar Evento</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>       
      </View> 
    </View>
  );
};

const styles = StyleSheet.create({

  listContent: {
    paddingBottom: 100, // Espaço extra para evitar que a lista fique escondida sob os botões
  },

  fixedButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0', // Cor de fundo para destacar a área dos botões
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
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 20,
  },
  eventItem: {
    flexDirection: 'row',
    padding: 15,
    marginVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  imageBox: {
    width: 100,
    height: 100,
    marginRight: 20,
    backgroundColor: '#ddd',
    borderRadius: 10,
  },
  eventInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  eventText: {
    fontSize: 16,
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#4caf50',
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Eventos;