import React, {useState} from "react";
import {Text, View, Modal, Button, Alert, SafeAreaView, StyleSheet} from "react-native";
import { useNavigation } from "@react-navigation/native"; // Importe useNavigation

export default function Moda(){
    const navigation = useNavigation(); // Chame o gancho de navegação
    const [modal, setModal] = useState(false);

    return(
        <SafeAreaView style={{flex:1, justifyContent:"center",alignItems:"center"}}>
            <Button title="Abrir Modal" onPress={()=>setModal(true)}/>
            <Modal
                visible={modal}
                transparent={true}
                animationType={"fade"}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalText}>
                            Bem-vindo ao nosso mundo de colecionáveis!
                        </Text>
                        <Button title="Fechar o Modal" onPress={()=>setModal(false)}></Button>
                    </View>
                </View>
            </Modal>
            {/* Botão para voltar à tela inicial */}
            <Button 
                title="Voltar para a tela inicial" 
                onPress={() => navigation.navigate('Inicial')} 
                color="#007BFF" 
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalText: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
});