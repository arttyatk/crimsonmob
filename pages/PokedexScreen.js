import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Animated,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';

const { width } = Dimensions.get('window');

const PokedexScreen = ({ navigation }) => {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPokemons, setFilteredPokemons] = useState([]);
  const [nextUrl, setNextUrl] = useState('');
  const [scrollY] = useState(new Animated.Value(0));

  useEffect(() => {
    fetchPokemons();
  }, []);

  useEffect(() => {
    if (searchQuery === '') {
      setFilteredPokemons(pokemons);
    } else {
      setFilteredPokemons(
        pokemons.filter(pokemon =>
          pokemon.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, pokemons]);

  const fetchPokemons = async (url = 'https://pokeapi.co/api/v2/pokemon?limit=20') => {
    try {
      const response = await fetch(url);
      const data = await response.json();
      setNextUrl(data.next);

      const pokemonDetails = await Promise.all(
        data.results.map(async pokemon => {
          const detailsResponse = await fetch(pokemon.url);
          const details = await detailsResponse.json();
          return {
            id: details.id,
            name: details.name,
            image: details.sprites.other['official-artwork'].front_default || details.sprites.front_default,
            types: details.types.map(typeInfo => typeInfo.type.name),
          };
        })
      );

      setPokemons(prev => [...prev, ...pokemonDetails]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pokemons:', error);
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (nextUrl && !loading) {
      fetchPokemons(nextUrl);
    }
  };

  const renderItem = ({ item, index }) => {
    const scale = scrollY.interpolate({
      inputRange: [-1, 0, 140 * index, 140 * (index + 2)],
      outputRange: [1, 1, 1, 0.8]
    });

    return (
      <Animated.View style={{ transform: [{ scale }], flex: 1, alignItems: 'center' }}>
        <TouchableOpacity
          style={styles.pokemonCard}
          onPress={() => navigation.navigate('PokemonDetail', { pokemon: item })}
        >
          <LinearGradient
            colors={['#8B0000', '#600000']}
            style={styles.gradientCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.pokemonId}>#{item.id.toString().padStart(3, '0')}</Text>
            <Image source={{ uri: item.image }} style={styles.pokemonImage} />
            <Text style={styles.pokemonName}>
              {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
            </Text>
            <View style={styles.typesContainer}>
              {item.types.map(type => (
                <View key={type} style={[styles.typeBadge, { backgroundColor: getTypeColor(type) }]}>
                  <Text style={styles.typeText}>{type}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const getTypeColor = (type) => {
    const typeColors = {
      normal: '#A8A878',
      fire: '#F08030',
      water: '#6890F0',
      electric: '#F8D030',
      grass: '#78C850',
      ice: '#98D8D8',
      fighting: '#C03028',
      poison: '#A040A0',
      ground: '#E0C068',
      flying: '#A890F0',
      psychic: '#F85888',
      bug: '#A8B820',
      rock: '#B8A038',
      ghost: '#705898',
      dragon: '#7038F8',
      dark: '#705848',
      steel: '#B8B8D0',
      fairy: '#EE99AC',
    };
    return typeColors[type] || '#68A090';
  };

  if (loading && pokemons.length === 0) {
    return (
      <LinearGradient colors={['#000000', '#1a0000', '#000000']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B0000" />
          <Text style={styles.loadingText}>Carregando Pokémons...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#000000', '#1a0000', '#000000']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Pokédex</Text>
          <Text style={styles.subtitle}>Encontre todos os Pokémon</Text>
        </View>

        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#8B0000" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar Pokémon..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <Animated.FlatList
          data={filteredPokemons}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.row}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          ListFooterComponent={
            loading ? <ActivityIndicator style={styles.footerLoader} color="#8B0000" /> : null
          }
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(139, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 30,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#8B0000',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: '#FFFFFF',
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
    // Removendo 'justifyContent' para permitir que o 'columnWrapperStyle' faça o trabalho
  },
  row: {
    justifyContent: 'center', // Centraliza as colunas na linha
    flex: 1,
  },
  pokemonCard: {
    flexGrow: 1, // Permite que o cartão cresça para preencher o espaço
    margin: 8,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    maxWidth: (width / 2) - 20, // Garante que o cartão não exceda a metade da tela
  },
  gradientCard: {
    padding: 15,
    alignItems: 'center',
    borderRadius: 15,
    minHeight: 180,
    width: '100%',
  },
  pokemonId: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    alignSelf: 'flex-start',
  },
  pokemonImage: {
    width: 100,
    height: 100,
    marginVertical: 5,
  },
  pokemonName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center',
  },
  typesContainer: {
    flexDirection: 'row',
    marginTop: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 15,
    margin: 2,
  },
  typeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  footerLoader: {
    marginVertical: 20,
  },
});

export default PokedexScreen;

