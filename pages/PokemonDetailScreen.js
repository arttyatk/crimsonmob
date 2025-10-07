import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';

const { width } = Dimensions.get('window');

const PokemonDetailScreen = ({ route, navigation }) => {
  const { pokemon } = route.params;
  const [pokemonDetails, setPokemonDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    fetchPokemonDetails();
  }, []);

  const fetchPokemonDetails = async () => {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}`);
      const data = await response.json();
      
      const speciesResponse = await fetch(data.species.url);
      const speciesData = await speciesResponse.json();
      
      setPokemonDetails({
        ...data,
        description: speciesData.flavor_text_entries.find(
          entry => entry.language.name === 'en'
        )?.flavor_text || 'No description available.',
        genus: speciesData.genera.find(gen => gen.language.name === 'en')?.genus || 'Unknown',
      });
      
      setLoading(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Error fetching pokemon details:', error);
      setLoading(false);
    }
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

  const getStatColor = (statName) => {
    const statColors = {
      hp: '#FF5959',
      attack: '#F5AC78',
      defense: '#FAE078',
      'special-attack': '#9DB7F5',
      'special-defense': '#A7DB8D',
      speed: '#FA92B2',
    };
    return statColors[statName] || '#68A090';
  };

  if (loading) {
    return (
      <LinearGradient colors={['#000000', '#1a0000', '#000000']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B0000" />
          <Text style={styles.loadingText}>Carregando detalhes...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#000000', '#1a0000', '#000000']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Icon name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.pokemonName}>
              {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
            </Text>
            <Text style={styles.pokemonId}>#{pokemon.id.toString().padStart(3, '0')}</Text>
          </View>

          <View style={styles.imageContainer}>
            <Image source={{ uri: pokemon.image }} style={styles.pokemonImage} />
          </View>

          <View style={styles.typesContainer}>
            {pokemon.types.map(type => (
              <View key={type} style={[styles.typeBadge, { backgroundColor: getTypeColor(type) }]}>
                <Text style={styles.typeText}>{type}</Text>
              </View>
            ))}
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'about' && styles.activeTab]} 
              onPress={() => setActiveTab('about')}
            >
              <Text style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}>Sobre</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'stats' && styles.activeTab]} 
              onPress={() => setActiveTab('stats')}
            >
              <Text style={[styles.tabText, activeTab === 'stats' && styles.activeTabText]}>Estatísticas</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'moves' && styles.activeTab]} 
              onPress={() => setActiveTab('moves')}
            >
              <Text style={[styles.tabText, activeTab === 'moves' && styles.activeTabText]}>Movimentos</Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'about' && pokemonDetails && (
            <View style={styles.tabContent}>
              <Text style={styles.description}>{pokemonDetails.description}</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Espécie:</Text>
                <Text style={styles.infoValue}>{pokemonDetails.genus}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Altura:</Text>
                <Text style={styles.infoValue}>{(pokemonDetails.height / 10).toFixed(1)} m</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Peso:</Text>
                <Text style={styles.infoValue}>{(pokemonDetails.weight / 10).toFixed(1)} kg</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Habilidades:</Text>
                <View style={styles.abilities}>
                  {pokemonDetails.abilities.map(ability => (
                    <View key={ability.ability.name} style={styles.abilityBadge}>
                      <Text style={styles.abilityText}>
                        {ability.ability.name.charAt(0).toUpperCase() + ability.ability.name.slice(1)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {activeTab === 'stats' && pokemonDetails && (
            <View style={styles.tabContent}>
              {pokemonDetails.stats.map(stat => (
                <View key={stat.stat.name} style={styles.statRow}>
                  <Text style={styles.statLabel}>
                    {stat.stat.name.charAt(0).toUpperCase() + stat.stat.name.slice(1)}:
                  </Text>
                  <View style={styles.statBarContainer}>
                    <View 
                      style={[
                        styles.statBar, 
                        { 
                          width: `${(stat.base_stat / 255) * 100}%`,
                          backgroundColor: getStatColor(stat.stat.name)
                        }
                      ]}
                    />
                  </View>
                  <Text style={styles.statValue}>{stat.base_stat}</Text>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'moves' && pokemonDetails && (
            <View style={styles.tabContent}>
              <Text style={styles.movesTitle}>Movimentos aprendidos:</Text>
              <View style={styles.movesContainer}>
                {pokemonDetails.moves.slice(0, 20).map(move => (
                  <View key={move.move.name} style={styles.moveBadge}>
                    <Text style={styles.moveText}>
                      {move.move.name.replace('-', ' ').charAt(0).toUpperCase() + move.move.name.replace('-', ' ').slice(1)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
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
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 40,
  },
  backButton: {
    padding: 5,
  },
  pokemonName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(139, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  pokemonId: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  pokemonImage: {
    width: 200,
    height: 200,
  },
  typesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  typeBadge: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  typeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(139, 0, 0, 0.2)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#8B0000',
  },
  tabText: {
    color: 'rgba(255,255,255,0.7)',
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#fff',
  },
  tabContent: {
    paddingHorizontal: 20,
  },
  description: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 20,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    width: 100,
    fontWeight: 'bold',
  },
  infoValue: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  abilities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  abilityBadge: {
    backgroundColor: 'rgba(139, 0, 0, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  abilityText: {
    color: '#fff',
    fontSize: 12,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statLabel: {
    color: '#fff',
    fontSize: 14,
    width: 120,
    fontWeight: 'bold',
  },
  statBarContainer: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 5,
    overflow: 'hidden',
    marginHorizontal: 10,
  },
  statBar: {
    height: '100%',
    borderRadius: 5,
  },
  statValue: {
    color: '#fff',
    fontSize: 14,
    width: 30,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  movesTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  movesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  moveBadge: {
    backgroundColor: 'rgba(139, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    margin: 5,
  },
  moveText: {
    color: '#fff',
    fontSize: 12,
  },
});

export default PokemonDetailScreen;