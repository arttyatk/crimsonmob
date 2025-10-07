import React, { useState } from "react";
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
  Platform, // << CORREÇÃO: Importar Platform
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from '@react-native-picker/picker';

// 🔑 URLs da API
const API_BASE_URL = "http://10.0.2.2:8000";
const API_ENDPOINT_URL = `${API_BASE_URL}/api`;

// Paleta de cores carmesim e preto
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

export default function CadastroItemScreen({ navigation }) {
  const [formData, setFormData] = useState({
    nome: '',
    titulo: '',
    // << CORREÇÃO: Alterado para minúsculas para corresponder aos valores do backend
    raridade: 'lendario', 
    tipo: 'personagem', 
    descricao: '',
    passivas: '',
    habilidades: '',
    taxa_drop: '',
  });
  
  const [imagem, setImagem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // 🔑 FUNÇÃO PARA OBTER INSTÂNCIA DO AXIOS
  const getAxiosInstance = async (contentType = 'multipart/form-data') => {
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

  // Função para converter texto em array
  const textoParaArray = (texto) => {
    if (!texto || !texto.trim()) {
      return [];
    }
    // Divide por quebras de linha e remove linhas vazias
    return texto
      .split('\n')
      .map(item => item.trim())
      .filter(item => item.length > 0);
  };

  // Função para selecionar imagem
  const selecionarImagem = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para selecionar uma imagem.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImagem(result.assets[0]);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  // Função para limpar formulário
  const limparFormulario = () => {
    setFormData({
      nome: '',
      titulo: '',
      raridade: 'lendario', // << CORREÇÃO: Mantido em minúsculas
      tipo: 'personagem', // << CORREÇÃO: Mantido em minúsculas
      descricao: '',
      passivas: '',
      habilidades: '',
      taxa_drop: '',
    });
    setImagem(null);
  };

  // Função para cadastrar item
  const cadastrarItem = async () => {
    // Validações
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

      const api = await getAxiosInstance();
      
      if (!api) {
        Alert.alert('Erro', 'Token de autenticação não encontrado. Faça login novamente.');
        navigation.replace('Login');
        return;
      }

      // Preparar dados do formulário
      const dados = new FormData();
      
      // Converter campos de texto para arrays
      const passivasArray = textoParaArray(formData.passivas);
      const habilidadesArray = textoParaArray(formData.habilidades);

      console.log('Arrays convertidos:', {
        passivas: passivasArray,
        habilidades: habilidadesArray
      });

      // Adicionar campos do formulário
      dados.append('nome', formData.nome);
      dados.append('titulo', formData.titulo || '');
      dados.append('raridade', formData.raridade);
      dados.append('tipo', formData.tipo);
      dados.append('descricao', formData.descricao || '');
      dados.append('taxa_drop', formData.taxa_drop);

      // CORREÇÃO: Enviar arrays, adicionando cada item individualmente para FormData
      passivasArray.forEach((passiva, index) => {
        dados.append(`passivas[${index}]`, passiva);
      });

      habilidadesArray.forEach((habilidade, index) => {
        dados.append(`habilidades[${index}]`, habilidade);
      });

      // Adicionar imagem se existir
      if (imagem) {
        // Correção para garantir que o nome do arquivo seja adequado
        const nomeArquivo = imagem.uri.split('/').pop();
        // Usar regex para obter a extensão
        const match = /\.(\w+)$/.exec(nomeArquivo);
        const extensao = match ? match[1] : 'jpg'; 
        
        // CORREÇÃO: Usar 'type' mais confiável para FormData
        let mimeType;
        switch (extensao.toLowerCase()) {
            case 'png': mimeType = 'image/png'; break;
            case 'jpg':
            case 'jpeg': mimeType = 'image/jpeg'; break;
            default: mimeType = `image/${extensao}`;
        }
        
        dados.append('imagem', {
          uri: imagem.uri,
          name: `gacha_${Date.now()}.${extensao}`,
          type: mimeType, // Definindo o tipo MIME
        });
      }

      console.log('Enviando dados para a API:', {
        nome: formData.nome,
        tipo: formData.tipo,
        raridade: formData.raridade,
        taxa_drop: formData.taxa_drop,
        passivas: passivasArray,
        habilidades: habilidadesArray,
        temImagem: !!imagem
      });

      // Log do FormData para debug
      console.log('FormData entries:');
      for (let [key, value] of dados.entries()) {
        console.log(key, value);
      }

      // Fazer requisição para a API
      const response = await api.post('/gacha-items', dados);
      
      console.log('Resposta da API:', response.data);
      
      setShowSuccessModal(true);
      limparFormulario();
      
    } catch (error) {
      console.error('Erro detalhado ao cadastrar item:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 401) {
        Alert.alert('Sessão Expirada', 'Faça login novamente para continuar.');
        navigation.replace('Login');
        return;
      }
      
      if (error.response?.status === 422) {
        // Erro de validação - mostrar detalhes específicos
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
                             'Não foi possível cadastrar o item. Verifique os dados e tente novamente.';
      
      Alert.alert('Erro no Cadastro', mensagemErro);
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
    <LinearGradient
      colors={[COLORS.background, COLORS.blackLight]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.logoContainer}>
              {/* O componente View não deve ser usado como imagem sem um conteúdo claro */}
              <View style={styles.logoImage} /> 
              <Text style={styles.logoText}>Crimson Star Admin</Text>
            </View>
            <Text style={styles.subtitle}>Painel de Controle para Gerenciamento de Cadastros</Text>
          </LinearGradient>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.contentHeader}>
            <Text style={styles.pageTitle}>Cadastrar Novo Personagem/Item</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Informações do Cadastro</Text>

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
                    // << CORREÇÃO: Estilo condicional para melhor compatibilidade Android/iOS
                    style={[styles.picker, Platform.OS === 'android' && { height: 50, color: COLORS.white }]}
                    dropdownIconColor={COLORS.primary}
                  >
                    {/* << CORREÇÃO: Values em minúsculas para o backend */}
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
                    // << CORREÇÃO: Estilo condicional para melhor compatibilidade Android/iOS
                    style={[styles.picker, Platform.OS === 'android' && { height: 50, color: COLORS.white }]}
                    dropdownIconColor={COLORS.primary}
                  >
                    {/* << CORREÇÃO: Values em minúsculas para o backend */}
                    <Picker.Item label="Personagem" value="personagem" />
                    <Picker.Item label="Item" value="item" />
                  </Picker>
                </View>
              </View>
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
                placeholder="Exemplo:&#10;Aumenta ataque em 20%&#10;Regenera vida a cada turno&#10;Imune a veneno"
                placeholderTextColor={COLORS.gray}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Habilidades */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Habilidade(s)</Text>
              <Text style={styles.hintText}>Digite cada habilidade em uma linha separada</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.habilidades}
                onChangeText={(text) => handleInputChange('habilidades', text)}
                placeholder="Exemplo:&#10;Corte Fulminante - Dano: 150%&#10;Escudo Divino - Defesa: +50%&#10;Explosão Cósmica - Dano: 300%"
                placeholderTextColor={COLORS.gray}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Taxa de Drop */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Taxa de Drop (%) *</Text>
              <TextInput
                style={styles.input}
                value={formData.taxa_drop}
                onChangeText={(text) => handleInputChange('taxa_drop', text)}
                placeholder="Ex: 5.0"
                placeholderTextColor={COLORS.gray}
                keyboardType="numeric"
              />
            </View>

            {/* Imagem */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Imagem do Personagem/Item</Text>
              <TouchableOpacity 
                style={styles.imageButton}
                onPress={selecionarImagem}
              >
                <Ionicons name="image-outline" size={24} color={COLORS.primary} />
                <Text style={styles.imageButtonText}>
                  {imagem ? 'Imagem Selecionada' : 'Selecionar Imagem'}
                </Text>
              </TouchableOpacity>
              
              {imagem && (
                <View style={styles.imagePreview}>
                  <Image 
                    source={{ uri: imagem.uri }} 
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.imageName} numberOfLines={1}>
                    {imagem.uri.split('/').pop()}
                  </Text>
                </View>
              )}
            </View>

            {/* Ações do Formulário */}
            <View style={styles.formActions}>
              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton]}
                onPress={limparFormulario}
                disabled={loading}
              >
                <Text style={styles.secondaryButtonText}>Limpar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.primaryButton]}
                onPress={cadastrarItem}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.primaryButtonText}>Cadastrar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal de Sucesso */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="checkmark-circle" size={64} color={COLORS.primary} />
            <Text style={styles.modalTitle}>Sucesso!</Text>
            <Text style={styles.modalMessage}>Item cadastrado com sucesso!</Text>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => {
                setShowSuccessModal(false);
                // Certifique-se de que 'ItensCRUD' é o nome da sua tela de lista
                navigation.navigate('ItensCRUD'); 
              }}
            >
              <Text style={styles.modalButtonText}>Ver Itens</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

// Os estyles permanecem os mesmos, mas os copio por completude
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerGradient: {
    padding: 25,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoImage: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: 10,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  contentHeader: {
    marginBottom: 25,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'rgba(40, 15, 15, 0.6)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
  },
  formGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 15,
  },
  flex1: {
    flex: 1,
  },
  label: {
    color: COLORS.primaryLight,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  hintText: {
    color: COLORS.gray,
    fontSize: 12,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: 'rgba(30, 10, 10, 0.7)',
    borderWidth: 1,
    borderColor: '#662222',
    borderRadius: 8,
    padding: 15,
    color: COLORS.white,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: 'rgba(30, 10, 10, 0.7)',
    borderWidth: 1,
    borderColor: '#662222',
    borderRadius: 8,
    overflow: 'hidden',
  },
  // O estilo 'picker' é usado no iOS. No Android, aplicamos a cor e a altura inline.
  picker: {
    color: COLORS.white,
    height: 50,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 10, 10, 0.7)',
    borderWidth: 1,
    borderColor: '#662222',
    borderRadius: 8,
    padding: 15,
    gap: 10,
  },
  imageButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  imagePreview: {
    marginTop: 10,
    alignItems: 'center',
  },
  previewImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 5,
  },
  imageName: {
    color: COLORS.gray,
    fontSize: 12,
    textAlign: 'center',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 15,
    marginTop: 25,
  },
  button: {
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'rgba(68, 51, 51, 0.8)',
  },
  secondaryButtonText: {
    color: COLORS.primaryLight,
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.blackLighter,
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 15,
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});