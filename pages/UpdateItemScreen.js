import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from '@react-native-picker/picker';

// 🔑 URLs da API
const API_BASE_URL = "http://10.0.2.2:8000";
const API_ENDPOINT_URL = `${API_BASE_URL}/api`;

// Paleta de cores carmesim e preto (Mantenha a mesma do ItemListScreen)
const COLORS = {
  primary: '#DC143C', // Carmesim
  primaryDark: '#B22222',
  primaryLight: '#FF6B6B',
  black: '#000000',
  blackLight: '#1A1A1A',
  blackLighter: '#2D2D2D',
  white: '#FFFFFF',
  gray: '#888888',
  background: '#0A0A0A',
};

// Função para converter Array em texto com quebras de linha para o formulário
const arrayParaTexto = (array) => {
  if (Array.isArray(array)) {
    return array.join('\n');
  }
  if (typeof array === 'string') {
     try {
        const parsedArray = JSON.parse(array);
        if (Array.isArray(parsedArray)) {
            return parsedArray.join('\n');
        }
     } catch (e) {
        // Se a string não for um JSON, tenta tratar como texto simples
        return array;
     }
  }
  return '';
};

export default function UpdateItemModal({ visible, itemData, onClose, onItemUpdated, navigation }) {
  const [formData, setFormData] = useState({
    nome: '',
    titulo: '',
    raridade: 'lendario',
    tipo: 'personagem',
    descricao: '',
    passivas: '',
    habilidades: '',
    taxa_drop: '',
  });
  
  const [loading, setLoading] = useState(false);

  // Efeito para carregar os dados do item quando a modal é aberta ou o itemData muda
  useEffect(() => {
    if (itemData) {
      setFormData({
        nome: itemData.nome || '',
        titulo: itemData.titulo || '',
        raridade: itemData.raridade?.toLowerCase() || 'lendario',
        tipo: itemData.tipo?.toLowerCase() || 'personagem',
        descricao: itemData.descricao || '',
        // Converte arrays para texto com quebras de linha para o textarea
        passivas: arrayParaTexto(itemData.passivas),
        habilidades: arrayParaTexto(itemData.habilidades),
        taxa_drop: String(itemData.taxa_drop) || '',
      });
    }
  }, [itemData]);

  // Função reutilizada
  const redirectToLogin = async () => {
    await AsyncStorage.removeItem('jwt');
    Alert.alert("Sessão Expirada", "Você precisa logar novamente.");
    // navigation pode não estar disponível aqui, mas é uma boa prática tentar
    if (navigation) navigation.replace("Login"); 
    else onClose(); // Fechar a modal se a navegação não for possível
  };

  // 🔑 FUNÇÃO PARA OBTER INSTÂNCIA DO AXIOS (com tipo JSON para o PUT)
  const getAxiosInstance = async (contentType = 'application/json') => {
    let token = null;
    try {
      const storedToken = await AsyncStorage.getItem("jwt");
      if (storedToken) {
        try {
            token = JSON.parse(storedToken); 
        } catch (e) {
            token = storedToken;
        }
      }
    } catch (e) {
      console.error("Erro ao ler token do AsyncStorage:", e);
    }
    
    if (!token) {
      return null; 
    }
    
    return axios.create({
      baseURL: API_ENDPOINT_URL,
      headers: {
        'Content-Type': contentType, 
        'Authorization': `Bearer ${token}`,
      },
    });
  };

  // Função para converter texto em array (reutilizada do CadastroItem)
  const textoParaArray = (texto) => {
    if (!texto || !texto.trim()) {
      return [];
    }
    return texto
      .split('\n')
      .map(item => item.trim())
      .filter(item => item.length > 0);
  };

  // 🚀 NOVA FUNÇÃO: ATUALIZAR ITEM
  const updateItem = async () => {
    if (!itemData || !itemData.id) {
        Alert.alert('Erro', 'ID do item não encontrado para atualização.');
        return;
    }

    // Validações (reutilizadas)
    if (!formData.nome.trim()) {
        Alert.alert('Erro', 'Por favor, informe o nome do personagem/item.');
        return;
    }

    if (!formData.taxa_drop || parseFloat(formData.taxa_drop) <= 0) {
        Alert.alert('Erro', 'Por favor, informe uma taxa de drop válida.');
        return;
    }

    try {
      setLoading(true);

      const api = await getAxiosInstance('application/json'); // Usamos JSON para PUT/PATCH

      if (!api) {
        redirectToLogin();
        return;
      }

      // Preparar dados para envio (JSON)
      // Converte campos de texto para arrays ANTES de enviar
      const dataToSend = {
          ...formData,
          passivas: textoParaArray(formData.passivas),
          habilidades: textoParaArray(formData.habilidades),
          // Laravel pode requerer o método _method para simular PUT/PATCH se não estiver em ambiente web
          _method: 'PUT' 
      };

      console.log(`Enviando dados de atualização para ID ${itemData.id}:`, dataToSend);
      
      // Fazer requisição PUT ou PATCH para a API
      // Nota: Muitos frameworks usam POST com _method=PUT para simular PUT/PATCH com FormData. 
      // Se você estiver usando JSON, use PUT diretamente.
      const response = await api.put(`/gacha-items/${itemData.id}`, dataToSend);
      
      console.log('Resposta da API (Update):', response.data);
      
      Alert.alert('Sucesso', `O item ${formData.nome} foi atualizado com sucesso!`);
      
      // Chama a função da tela principal para atualizar a lista
      onItemUpdated(response.data); 
      onClose(); // Fecha a modal
      
    } catch (error) {
      console.error('Erro detalhado ao atualizar item:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 401) {
        redirectToLogin();
        return;
      }
      
      if (error.response?.status === 422) {
        const validationErrors = error.response?.data?.errors;
        if (validationErrors) {
          const errorMessages = Object.values(validationErrors).flat().join('\n');
          Alert.alert('Erro de Validação', errorMessages);
        } else {
          Alert.alert('Erro de Validação', 'Verifique os dados do formulário.');
        }
        return;
      }
      
      const mensagemErro = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Não foi possível atualizar o item. Verifique os dados e tente novamente.';
      
      Alert.alert('Erro na Atualização', mensagemErro);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="slide"
      transparent={true}
    >
      <LinearGradient
        colors={[COLORS.background, COLORS.blackLight]}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Atualizar Item/Personagem</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close-circle-outline" size={32} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>ID do Item: {itemData?.id}</Text>

              {/* Nome */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nome do Personagem/Item *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.nome}
                  onChangeText={(text) => handleInputChange('nome', text)}
                  placeholder="Ex: Wriothesley"
                  placeholderTextColor={COLORS.gray}
                />
              </View>

              {/* Título */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Título/Classe</Text>
                <TextInput
                  style={styles.input}
                  value={formData.titulo}
                  onChangeText={(text) => handleInputChange('titulo', text)}
                  placeholder="Ex: Emissary of Solitary Iniquity"
                  placeholderTextColor={COLORS.gray}
                />
              </View>

              {/* Raridade e Tipo */}
              <View style={styles.row}>
                <View style={[styles.formGroup, styles.flex1]}>
                  <Text style={styles.label}>Raridade</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={formData.raridade}
                      onValueChange={(value) => handleInputChange('raridade', value)}
                      style={[styles.picker, Platform.OS === 'android' && { height: 50, color: COLORS.white }]}
                      dropdownIconColor={COLORS.primary}
                    >
                       <Picker.Item label="Lendário" value="lendario" />
                       <Picker.Item label="Épico" value="epico" />
                       <Picker.Item label="Raro" value="raro" />
                       <Picker.Item label="Incomum" value="incomum" />
                       <Picker.Item label="Comum" value="comum" />
                    </Picker>
                  </View>
                </View>

                <View style={[styles.formGroup, styles.flex1]}>
                  <Text style={styles.label}>Tipo</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={formData.tipo}
                      onValueChange={(value) => handleInputChange('tipo', value)}
                      style={[styles.picker, Platform.OS === 'android' && { height: 50, color: COLORS.white }]}
                      dropdownIconColor={COLORS.primary}
                    >
                      <Picker.Item label="Personagem" value="personagem" />
                      <Picker.Item label="Item" value="item" />
                    </Picker>
                  </View>
                </View>
              </View>
              
              {/* Taxa de Drop */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Taxa de Drop (%) *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.taxa_drop}
                  onChangeText={(text) => handleInputChange('taxa_drop', text)}
                  placeholder="Ex: 0.6"
                  placeholderTextColor={COLORS.gray}
                  keyboardType="numeric"
                />
              </View>

              {/* Descrição */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Descrição</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.descricao}
                  onChangeText={(text) => handleInputChange('descricao', text)}
                  placeholder="Digite a descrição..."
                  placeholderTextColor={COLORS.gray}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* Passivas */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Passiva(s)</Text>
                <Text style={styles.hintText}>Digite cada passiva em uma linha separada</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.passivas}
                  onChangeText={(text) => handleInputChange('passivas', text)}
                  placeholder="Passiva 1&#10;Passiva 2&#10;..."
                  placeholderTextColor={COLORS.gray}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* Habilidades */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Habilidades(s)</Text>
                <Text style={styles.hintText}>Digite cada habilidade em uma linha separada</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.habilidades}
                  onChangeText={(text) => handleInputChange('habilidades', text)}
                  placeholder="Habilidade 1&#10;Habilidade 2&#10;..."
                  placeholderTextColor={COLORS.gray}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            
            </View>
          </ScrollView>

          {/* Botão de Atualizar */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={updateItem}
            disabled={loading}
          >
            <LinearGradient
              colors={loading ? [COLORS.gray, COLORS.gray] : [COLORS.primaryDark, COLORS.primary]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={styles.buttonText}>
                  <Ionicons name="save-outline" size={20} color={COLORS.white} />
                  {'  '}Salvar Alterações
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)', // Fundo escuro
  },
  modalContent: {
    width: '95%',
    maxWidth: 600,
    maxHeight: '95%',
    backgroundColor: COLORS.blackLighter,
    borderRadius: 15,
    padding: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.blackLight,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  closeButton: {
    padding: 5,
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  formContainer: {
    marginTop: 10,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primaryLight,
    marginBottom: 15,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    color: COLORS.white,
    fontSize: 14,
    marginBottom: 5,
    fontWeight: '600',
  },
  hintText: {
    color: COLORS.gray,
    fontSize: 12,
    marginBottom: 5,
  },
  input: {
    backgroundColor: COLORS.blackLight,
    color: COLORS.white,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.blackLighter,
  },
  textArea: {
    height: 100,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15, // Adicionado gap para espaço
  },
  flex1: {
    flex: 1,
  },
  pickerContainer: {
    backgroundColor: COLORS.blackLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.blackLighter,
    overflow: 'hidden',
    height: Platform.OS === 'ios' ? 120 : 50, // Altura diferente para iOS
    justifyContent: 'center',
  },
  picker: {
    width: '100%',
    color: COLORS.white,
  },
  submitButton: {
    marginTop: 20,
    marginHorizontal: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  buttonGradient: {
    padding: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    flexDirection: 'row',
    alignItems: 'center',
  },
});