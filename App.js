import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Importe os componentes de tela
import Login from './pages/login.js';
import RegisterScreen from './pages/registro.js';
import Inicial from './pages/inicial.js';
import PokedexScreen from './pages/PokedexScreen.js';
import PokemonDetailScreen from './pages/PokemonDetailScreen.js';
import Moda from './pages/moda.js';
import Contact from './pages/fletlist.js';
import Splashscreen from './pages/splashscreen.js'; 
import ItemCrudScreen from './pages/ItemCrudScreen.js'; // CRUD dos Itens/Personagens
import CadastroItemScreen from './pages/CadastroItemScreen.js'; // Nova tela de cadastro

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        {/* As linhas foram agrupadas para garantir que não haja nada
            além das tags <Stack.Screen /> como filhos diretos do Stack.Navigator. */}
        <Stack.Screen name="Splash" component={Splashscreen} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
        <Stack.Screen name="Inicial" component={Inicial} />
        <Stack.Screen name="Pokedex" component={PokedexScreen} />
        <Stack.Screen name="PokemonDetail" component={PokemonDetailScreen} />
        <Stack.Screen name="Moda" component={Moda} />
        <Stack.Screen name="Contact" component={Contact} />
        <Stack.Screen name="ItensCRUD" component={ItemCrudScreen} />
        <Stack.Screen name="CadastroItem" component={CadastroItemScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}