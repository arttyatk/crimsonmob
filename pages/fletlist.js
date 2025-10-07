import React from "react";
import { SafeAreaView, Text, FlatList, Pressable, Alert, StyleSheet, Button } from "react-native";
import { useNavigation } from "@react-navigation/native"; // Importe useNavigation

export default function Contact(){
    const navigation = useNavigation(); // Chame o gancho de navegação
    
    const Data = [
        {id:"1",title:"Poco"},
        {id:"2",title:"Barril de Goblins"},
        {id:"3",title:"Pedro Lucas"},
        {id:"4",title:"Drogas"},
        {id:"5",title:"Taco de Baseball"},
    ];

    const Alerta = (title) => {
        Alert.alert("Você clicou em", title);
    };

    const Renderizar = ({ item }) => (
        <Pressable
            onPress={() => Alerta(item.title)}
            style={({ pressed }) => [
                styles.itemContainer,
                {
                    backgroundColor: pressed ? "#ddd" : "#a32"
                }
            ]}
        >
            <Text style={styles.itemText}>{item.title}</Text>
        </Pressable>
    );

    return(
        <SafeAreaView style={styles.container}>
            <Text style={styles.headerTitle}>Personagens</Text>
            <FlatList
                data={Data}
                renderItem={Renderizar}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
            />
            {/* Botão para voltar à tela inicial */}
            <Button 
                title="Voltar para a tela inicial" 
                onPress={() => navigation.navigate('Inicial')} 
                color="#007BFF" 
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
        paddingTop: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginBottom: 20,
    },
    itemContainer: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#444",
    },
    itemText: {
        color: 'white',
        fontSize: 18,
    },
    listContainer: {
        paddingBottom: 20,
    },
});