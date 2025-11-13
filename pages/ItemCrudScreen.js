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
import * as ImagePicker from "expo-image-picker";

// 🔑 Padronizado o IP - Recomendo voltar para 10.0.2.2:8000 se estiver no Emulador Android
// Mantenha 10.122.41.160:8000 (seu IP local) se estiver em um Celular Físico
const API_BASE_URL = "http://10.0.2.2:8000";
const API_ENDPOINT_URL = `${API_BASE_URL}/api`;

// Paleta de cores (Mantida)
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

// Componente de imagem (Mantido, mas ajustei o console.log para mostrar a URL)
const CustomImage = ({ item }) => {
    const imageUrl = item.imagem 
        ? `${API_BASE_URL}/storage/${item.imagem.replace(/^\/+/, '')}`
        : null;

    return (
        <View style={styles.itemImage}>
            {imageUrl ? (
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.itemImage}
                    resizeMode="contain"
                    // Logamos a URL completa do erro para facilitar o debug de rede
                    onError={(e) => console.log('Erro ao carregar imagem:', imageUrl, e.nativeEvent.error)}
                />
            ) : (
                <View style={[styles.itemImage, styles.imagePlaceholder]}>
                    <Ionicons name="image-outline" size={50} color={COLORS.gray} />
                    <Text style={styles.placeholderText}>Sem imagem</Text>
                </View>
            )}
        </View>
    );
};

// Componente separado para o card animado (Mantido)
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
            'lendário': '#FFD700',
            'mitico': '#FFD700',
            'common': COLORS.gray,
            'rare': '#4CAF50',
            'epic': '#9C27B0',
            'legendary': '#FFD700',
            'mythic': '#FFD700'
        };
        return rarityColors[raridade?.toLowerCase()] || COLORS.primary;
    };

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
            // CHAVE ÚNICA E ESTÁVEL
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
                {/* Botões de Ação */}
                <View style={styles.actionButtonsContainer}>
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
                </View>
                
                {/* IMAGEM */}
                <View style={styles.imageContainer}>
                    <CustomImage item={item} />
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
            
            // ✅ CORREÇÃO 1: Garante que 'items' é um array, mesmo se a API retornar null ou outro valor inválido.
            setItems(Array.isArray(response.data) ? response.data : []);

        } catch (error) {
            console.error("Erro ao carregar itens da API:", error.response?.data || error.message);
            const status = error.response?.status;
            
            if (status === 401 || error.response?.data?.message === "Token não fornecido.") {
                redirectToLogin();
                return;
            }
            
            let errorMessage = "Não foi possível carregar os itens.";
            
            if (error.response?.data) {
                errorMessage = error.response.data.message || error.response.data || errorMessage;
            } else if (error.message) {
                errorMessage = error.message;
            }

            if (typeof errorMessage !== 'string') {
                errorMessage = JSON.stringify(errorMessage);
            }
            
            Alert.alert("Erro", errorMessage);
            
            // 🛑 Se a API falhar, force 'items' a ser um array vazio para evitar o erro de renderização
            setItems([]); 

        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [navigation]); 

    // Função de exclusão (Mantida)
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
                {/* Cabeçalho */}
                <View style={styles.header}>
                    <LinearGradient
                        colors={[COLORS.primary, COLORS.primaryDark]}
                        style={styles.headerGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Ionicons name="cube" size={32} color={COLORS.white} style={styles.headerIcon} />
                        <Text style={styles.headerTitle}>Lista de Itens Gacha</Text>
                        
                        {/* ✅ CORREÇÃO 2: Usa o operador de encadeamento opcional (?) para evitar o erro fatal. */}
                        <Text style={styles.headerSubtitle}>
                            {items?.length || 0} itens • {items?.filter(item => item.imagem).length || 0} com imagens
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
                onItemUpdated={onFormSuccess} 
                getAxiosInstance={getAxiosInstance}
                redirectToLogin={redirectToLogin}
            />
        </LinearGradient>
    );
}

// Estilos (Mantidos)
const styles = StyleSheet.create({
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
    actionButtonsContainer: {
        position: 'absolute',
        top: 12,
        left: 12,
        zIndex: 10,
        gap: 8, 
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
    // ... (Outros estilos relacionados a imagem omitidos por brevidade, mas mantidos iguais)
    placeholderText: {
        color: COLORS.gray,
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
    deleteButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderWidth: 1,
        borderColor: COLORS.danger,
    },
    editButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
    loadingText: {
        color: COLORS.primary,
        fontSize: 12,
        marginTop: 8,
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