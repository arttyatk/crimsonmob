import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform, 
  Alert 
} from "react-native";
import Container from "../components/container";
import Texto from "../components/text";
import Input from "../components/input";
import Botao from "../components/button";
import api from "../src/services/api";

export default function Home({ navigation }) {
    const [cep, setCep] = useState('');
    const [logradouro, setLogradouro] = useState('');
    const [bairro, setBairro] = useState('');
    const [localidade, setLocalidade] = useState('');
    const [uf, setUf] = useState('');

    const Buscar = async () => {
        if (cep.length !== 8) {
            Alert.alert("Erro", "Por favor, digite um CEP válido com 8 dígitos.");
            return;
        }

        try {
            const response = await api.get(`${cep}/json/`);
            if (response.data.erro) {
                Alert.alert("Erro", "CEP não encontrado. Por favor, verifique o número.");
                return;
            }
            setLogradouro(response.data.logradouro);
            setBairro(response.data.bairro);
            setLocalidade(response.data.localidade);
            setUf(response.data.uf);
        } catch (error) {
            Alert.alert("Erro", "Não foi possível buscar o CEP. Verifique sua conexão.");
            console.log('Erro de Conexão!', error);
        }
    };
    
    // Função para navegar de volta para a tela de login
    const handleGoBackToLogin = () => {
        if (navigation) {
            navigation.navigate('Login');
        } else {
            console.log('Navegação não disponível');
        }
    };

    // Função para navegar para a Pokedex
    const handleGoToPokedex = () => {
        if (navigation) {
            navigation.navigate('PokedexDrawer'); // Alterado para 'PokedexDrawer'
        }
    };

    return (
        <Container>
            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView
                    style={styles.keyboardAvoidingView}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <View style={styles.formContainer}>
                        <Texto txt={"Busca de CEP"} style={styles.title} />

                        <Texto txt={"CEP"} style={styles.label} />
                        <Input 
                            placeholder={"Digite o CEP"} 
                            value={cep} 
                            onChangeText={setCep} 
                            keyboardType="numeric"
                            maxLength={8}
                        />

                        {logradouro !== '' && (
                            <>
                                <Texto txt={"Rua"} style={styles.label} />
                                <Input value={logradouro} editable={false} />

                                <Texto txt={"Bairro"} style={styles.label} />
                                <Input value={bairro} editable={false} />
                                
                                <Texto txt={"Cidade"} style={styles.label} />
                                <Input value={localidade} editable={false} />

                                <Texto txt={"Estado"} style={styles.label} />
                                <Input value={uf} editable={false} />
                            </>
                        )}
                        
                        <Botao txt={"BUSCAR"} onPress={Buscar} />
                        
                        {/* Botão para acessar a Pokedex */}
                        <TouchableOpacity style={styles.pokedexButton} onPress={handleGoToPokedex}>
                            <Texto txt={"Explorar Pokédex"} style={styles.pokedexButtonText} />
                        </TouchableOpacity>
                        
                        {/* Botão para voltar ao login */}
                        <TouchableOpacity style={styles.backButton} onPress={handleGoBackToLogin}>
                            <Texto txt={"Voltar para o Login"} style={styles.backButtonText} />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </Container>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    keyboardAvoidingView: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    formContainer: {
        width: '90%',
        padding: 20,
        borderRadius: 15,
        backgroundColor: 'rgba(51, 51, 51, 0.5)',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#F0F0F0',
    },
    label: {
        alignSelf: 'flex-start',
        marginBottom: 5,
        marginTop: 10,
        color: '#F0F0F0',
    },
    pokedexButton: {
        marginTop: 20,
        padding: 12,
        backgroundColor: '#BB0000',
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    pokedexButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    backButton: {
        marginTop: 15,
    },
    backButtonText: {
        color: '#DC143C',
        textDecorationLine: 'underline',
        fontSize: 16,
    }
});