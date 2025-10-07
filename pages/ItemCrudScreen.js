import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  Text,
  ActivityIndicator,
  Image,
  Animated,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import UpdateItemModal from "./UpdateItemScreen"; 

// 🔑 Padronizado o IP (Deve ser o mesmo da sua API Laravel/Backend)
const API_BASE_URL = "http://10.0.2.2:8000";
const API_ENDPOINT_URL = `${API_BASE_URL}/api`;

// Paleta de cores
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
  danger: '#FF4136', 
  success: '#2ECC40', 
};

// Cache para URLs que já falharam
const failedImageCache = new Set();

// Componente de imagem com retry automático (Mantido)
const CustomImage = ({ itemId, imagePath }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [currentUrl, setCurrentUrl] = useState('');

  const getImageUrl = (useCacheBuster = false) => {
    if (!imagePath) return null;
    const cleanPath = imagePath.replace(/^\/+/, '');
    if (imagePath.startsWith('http')) return imagePath;
    
    let url = `${API_BASE_URL}/storage/${cleanPath}`;
    
    if (useCacheBuster && retryCount > 0) {
      url += `?retry=${retryCount}&t=${Date.now()}`;
    }
    return url;
  };

  const hasUrlFailedBefore = (url) => {
    return failedImageCache.has(url.split('?')[0]); 
  };

  const handleImageError = (error) => {
    const urlWithoutParams = currentUrl.split('?')[0];
    console.warn(`[ERRO IMAGEM] Item ${itemId} (Tentativa ${retryCount + 1}):`, {
      url: currentUrl,
      path: imagePath,
      error: error.nativeEvent?.error,
      retryCount
    });
    
    failedImageCache.add(urlWithoutParams);
    
    if (retryCount < 2) {
      setTimeout(() => {
        console.log(`[RETRY] Tentando novamente imagem ${itemId}, tentativa ${retryCount + 2}`);
        setRetryCount(prev => prev + 1);
        setImageError(false);
        setImageLoading(true);
        const newUrl = getImageUrl(true);
        setCurrentUrl(newUrl);
      }, 1000 * (retryCount + 1));
    } else {
      setImageError(true);
      setImageLoading(false);
    }
  };

  const handleImageLoad = () => {
    console.log(`[SUCESSO IMAGEM] Item ${itemId} carregado na tentativa ${retryCount + 1}:`, currentUrl);
    setImageError(false);
    setImageLoading(false);
    const urlWithoutParams = currentUrl.split('?')[0];
    failedImageCache.delete(urlWithoutParams);
  };

  const handleImageLoadStart = () => { setImageLoading(true); };
  const handleImageLoadEnd = () => { setImageLoading(false); };

  useEffect(() => {
    const initialUrl = getImageUrl();
    setCurrentUrl(initialUrl);
    if (initialUrl && hasUrlFailedBefore(initialUrl)) {
      console.log(`[CACHE] URL já falhou antes, pulando: ${initialUrl}`);
      setImageError(true);
      setImageLoading(false);
    }
  }, [imagePath]);

  if (!currentUrl || imageError) {
    return (
      <View style={[styles.itemImage, styles.imagePlaceholder]}>
        <Ionicons name="image-outline" size={50} color={COLORS.gray} />
        <Text style={styles.placeholderText}>
          {!imagePath ? 'Sem imagem' : 'Erro ao carregar'}
        </Text>
        {retryCount > 0 && (
          <Text style={styles.retryText}>Tentativas: {retryCount}/3</Text>
        )}
        {imagePath && (
          <Text style={styles.debugText} numberOfLines={1}>Path: {imagePath}</Text>
        )}
        {imageError && retryCount >= 2 && (
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setRetryCount(0);
              setImageError(false);
              setImageLoading(true);
              const newUrl = getImageUrl(true);
              setCurrentUrl(newUrl);
            }}
          >
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.itemImage}>
      {imageLoading && (
        <View style={styles.imageLoading}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingText}>
            Carregando... {retryCount > 0 && `(Tentativa ${retryCount + 1})`}
          </Text>
        </View>
      )}
      <Image
        source={{ 
          uri: currentUrl,
          cache: retryCount > 0 ? 'reload' : 'default'
        }}
        style={styles.itemImage}
        onError={handleImageError}
        onLoad={handleImageLoad}
        onLoadStart={handleImageLoadStart}
        onLoadEnd={handleImageLoadEnd}
        resizeMode="contain"
      />
    </View>
  );
};

// Componente separado para o card animado (Mantido com a correção da key)
const AnimatedCard = ({ item, index, onDeleteItem, onEditItem }) => {
  const cardAnim = React.useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    Animated.spring(cardAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, []);

  const getRarityColor = (raridade) => {
    const rarityColors = {
      'comum': COLORS.gray,
      'raro': '#4CAF50',
      'épico': '#9C27B0',
      'lendário': COLORS.primary,
      'mitico': '#FFD700',
      'common': COLORS.gray,
      'rare': '#4CAF50',
      'epic': '#9C27B0',
      'legendary': COLORS.primary,
      'mythic': '#FFD700'
    };
    return rarityColors[raridade?.toLowerCase()] || COLORS.primary;
  };

  /**
   * ✅ CORREÇÃO CHAVE DUPLICADA E <TEXT> (Mantida)
   */
  const formatArrayForDisplay = (data, fieldName) => {
    if (!data) {
        return <Text style={styles.listItem}>N/A</Text>;
    }

    let arrayData = [];
    
    if (Array.isArray(data)) {
        arrayData = data;
    } else if (typeof data === 'string') {
        try {
            arrayData = JSON.parse(data);
        } catch (e) {
            return <Text style={styles.listItem}>{data || 'N/A'}</Text>;
        }
    } else {
        return <Text style={styles.listItem}>Dados Inválidos: {String(data)}</Text>;
    }

    if (!Array.isArray(arrayData) || arrayData.length === 0) {
        return <Text style={styles.listItem}>N/A</Text>;
    }
    
    return arrayData.map((listItem, itemIndex) => (
      // 🚀 CHAVE ÚNICA E ESTÁVEL
      <View key={`${item.id}_${fieldName}_${itemIndex}`} style={styles.listItemContainer}>
        <Ionicons name="ellipse" size={8} color={COLORS.primary} style={styles.bulletIcon} />
        <Text style={styles.listItem}>{String(listItem)}</Text>
      </View>
    ));
  };
  
  return (
    <Animated.View 
      style={[
        styles.card,
        {
          opacity: cardAnim,
          transform: [
            { 
              translateY: cardAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0]
              })
            }
          ]
        }
      ]}
    >
      <LinearGradient
        colors={[COLORS.blackLighter, COLORS.blackLight]}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Botões de Ação (Mantidos) */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDeleteItem(item.id, item.nome)} 
        >
          <Ionicons name="trash-outline" size={24} color={COLORS.danger} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => onEditItem(item)} 
        >
          <Ionicons name="pencil-outline" size={24} color={COLORS.success} />
        </TouchableOpacity>
        
        <View style={styles.imageContainer}>
          <CustomImage 
            itemId={item.id}
            imagePath={item.imagem}
          />
          <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(item.raridade) }]}>
            <Text style={styles.rarityText}>{item.raridade}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{item.nome} (ID: {item.id})</Text>
          </View>

          <Text style={styles.subtitleCard}>Título: {item.titulo || 'N/A'}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="cube" size={16} color={COLORS.primary} />
              <Text style={styles.statText}>Tipo: {item.tipo}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="trending-up" size={16} color={COLORS.primary} />
              <Text style={styles.statText}>Drop: {item.taxa_drop}%</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text" size={18} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Descrição</Text>
            </View>
            <Text style={styles.descriptionText}>{item.descricao || 'Sem descrição.'}</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="flash" size={18} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Passivas</Text>
            </View>
            <View style={styles.listContainer}>{formatArrayForDisplay(item.passivas, 'passivas')}</View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="star" size={18} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Habilidades</Text>
            </View>
            <View style={styles.listContainer}>{formatArrayForDisplay(item.habilidades, 'habilidades')}</View>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

export default function ItemCrudScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null); 

  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];
  
  // Funções auxiliares (Mantidas)
  const redirectToLogin = async () => {
    await AsyncStorage.removeItem('jwt');
    Alert.alert("Sessão Expirada", "Você precisa logar novamente para ver os itens.");
    navigation.replace("Login"); 
  };
    
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

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      failedImageCache.clear();
      
      const api = await getAxiosInstance();
      
      if (!api) {
        redirectToLogin(); 
        return;
      }
      
      const response = await api.get("/gacha-items");
      setItems(response.data);
    } catch (error) {
      console.error("Erro ao carregar itens da API:", error.response?.data || error.message);
      const status = error.response?.status;
      
      if (status === 401 || error.response?.data?.message === "Token não fornecido.") {
          redirectToLogin();
          return;
      }
      
      // 💥 APLICAÇÃO DA CORREÇÃO PARA O ERRO "ReadableNativeMap to String"
      let errorMessage = "Não foi possível carregar os itens.";
      
      if (error.response?.data) {
          // Tenta obter a mensagem mais detalhada
          errorMessage = error.response.data.message || error.response.data || errorMessage;
      } else if (error.message) {
          errorMessage = error.message;
      }

      // Se o que passamos para o Alert.alert não for uma string, stringify
      if (typeof errorMessage !== 'string') {
          // Usa JSON.stringify para transformar o objeto (Map) em string
          errorMessage = JSON.stringify(errorMessage);
      }
      
      Alert.alert("Erro", errorMessage);

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigation]); 

  // ... (Restante do código mantido)

  // Função de exclusão (Mantida, mas também aplicamos a correção de stringify no Alert.alert)
  const deleteItem = useCallback(async (itemId, itemName) => {
    Alert.alert(
      "Confirmar Exclusão",
      `Tem certeza que deseja excluir o item/personagem ${itemName} (ID: ${itemId})? Esta ação é irreversível.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const api = await getAxiosInstance();
              
              if (!api) {
                redirectToLogin();
                return;
              }

              await api.delete(`/gacha-items/${itemId}`);

              Alert.alert("Sucesso", `O item ${itemName} foi excluído.`);
              setItems(prevItems => prevItems.filter(item => item.id !== itemId));
              
            } catch (error) {
              console.error(`Erro ao excluir item ${itemId}:`, error.response?.data || error.message);
              
              const status = error.response?.status;
              if (status === 401) {
                redirectToLogin();
                return;
              }
              
              // 💥 APLICAÇÃO DA CORREÇÃO AQUI TAMBÉM
              let errorMessage = error.response?.data?.message || error.message || "Não foi possível excluir o item.";
              if (typeof errorMessage !== 'string') {
                  errorMessage = JSON.stringify(error.response?.data || error.message);
              }

              Alert.alert("Erro", errorMessage);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }, [navigation]);

  // Funções de Modal (Mantidas)
  const startEditing = useCallback((item) => {
    setEditingItem(item);
    setModalVisible(true);
  }, []);

  const startCreating = useCallback(() => {
    setEditingItem(null); 
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setEditingItem(null);
  }, []);

  const onFormSuccess = useCallback((message) => {
    closeModal();
    // Garante que a mensagem de sucesso seja string (boa prática)
    Alert.alert("Sucesso", String(message)); 
    fetchItems();
  }, [fetchItems, closeModal]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchItems();
  }, [fetchItems]);
  
  // Efeitos e Renderização (Mantidos)
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
    
    fetchItems();
  }, [fetchItems, fadeAnim, scaleAnim]);

  const renderItem = ({ item, index }) => (
    <AnimatedCard 
      item={item} 
      index={index} 
      onDeleteItem={deleteItem} 
      onEditItem={startEditing} 
    />
  );


  return (
    <LinearGradient
      colors={[COLORS.background, COLORS.blackLight]}
      style={styles.container}
    >
      <Animated.View 
        style={[
          styles.animatedContainer,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
        ]}
      >
        {/* Cabeçalho (Mantido) */}
        <View style={styles.header}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="cube" size={32} color={COLORS.white} style={styles.headerIcon} />
            <Text style={styles.headerTitle}>Lista de Itens Gacha</Text>
            <Text style={styles.headerSubtitle}>
              {items.length} itens • {items.filter(item => item.imagem).length} com imagens
            </Text>
            {/* Botão de Criação */}
            <TouchableOpacity 
              style={styles.createButton} 
              onPress={startCreating}
            >
              <Ionicons name="add-circle" size={30} color={COLORS.success} />
              <Text style={styles.createButtonText}>Novo Item</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Lista/Loading (Mantido) */}
        {loading && items.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Carregando itens...</Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => String(item.id)}
            refreshing={refreshing}
            onRefresh={onRefresh}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="sad-outline" size={64} color={COLORS.gray} />
                <Text style={styles.emptyText}>Nenhum item encontrado.</Text>
                <TouchableOpacity style={styles.refreshButton} onPress={fetchItems}>
                  <Text style={styles.refreshButtonText}>Tentar Novamente</Text>
                </TouchableOpacity>
              </View>
            }
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </Animated.View>

      {/* Modal de Criação/Atualização */}
      <UpdateItemModal
        visible={modalVisible}
        onClose={closeModal}
        itemData={editingItem} 
        onItemUpdated={onFormSuccess} // <-- Mantida a correção onItemUpdated
        getAxiosInstance={getAxiosInstance}
        redirectToLogin={redirectToLogin}
      />
    </LinearGradient>
  );
}

// Estilos (Mantidos)
const styles = StyleSheet.create({
    // ... (Seus estilos)
    container: {
        flex: 1,
    },
    animatedContainer: {
        flex: 1,
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
        paddingBottom: 60,
    },
    headerIcon: {
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.white,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    headerSubtitle: {
        fontSize: 12,
        color: COLORS.white,
        opacity: 0.8,
        marginTop: 5,
    },
    createButton: {
        position: 'absolute',
        bottom: -25,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.blackLight,
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: COLORS.success,
        shadowColor: COLORS.success,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 10,
    },
    createButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    listContent: {
        padding: 16,
        paddingBottom: 30,
        paddingTop: 40,
    },
    card: {
        marginVertical: 8,
        borderRadius: 16,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
        overflow: 'hidden',
    },
    cardGradient: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    imageContainer: {
        position: 'relative',
    },
    itemImage: {
        width: '100%',
        height: 250,
        backgroundColor: '#1A1A1A',
    },
    imagePlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.gray,
        borderStyle: 'dashed',
    },
    imageLoading: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.1)',
        zIndex: 1,
    },
    placeholderText: {
        color: COLORS.gray,
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
    retryText: {
        color: COLORS.primaryLight,
        fontSize: 12,
        marginTop: 4,
    },
    loadingText: {
        color: COLORS.primary,
        fontSize: 12,
        marginTop: 8,
    },
    debugText: {
        color: COLORS.gray,
        fontSize: 10,
        marginTop: 4,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: COLORS.primary,
        borderRadius: 12,
    },
    retryButtonText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    deleteButton: {
        position: 'absolute',
        top: 12,
        left: 12,
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 10,
        borderWidth: 1,
        borderColor: COLORS.danger,
    },
    editButton: {
        position: 'absolute',
        top: 12,
        right: 70,
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 10,
        borderWidth: 1,
        borderColor: COLORS.success,
    },
    rarityBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    rarityText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    cardContent: {
        padding: 20,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 20,
        color: COLORS.white,
        flex: 1,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    subtitleCard: {
        fontSize: 14,
        color: COLORS.primaryLight,
        marginBottom: 15,
    },
    statsContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 15,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(220, 20, 60, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(220, 20, 60, 0.3)',
    },
    statText: {
        color: COLORS.primaryLight,
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
    },
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    sectionTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        color: COLORS.white,
        marginLeft: 8,
    },
    descriptionText: {
        color: COLORS.gray,
        fontSize: 14,
        lineHeight: 20,
    },
    listContainer: {
        marginLeft: 8,
    },
    listItemContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 6,
    },
    bulletIcon: {
        marginTop: 6,
        marginRight: 8,
    },
    listItem: {
        flex: 1,
        fontSize: 14,
        color: COLORS.gray,
        lineHeight: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        color: COLORS.gray,
        fontSize: 18,
        marginTop: 16,
        marginBottom: 24,
    },
    refreshButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    refreshButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});