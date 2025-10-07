import React from "react";
import { TouchableOpacity, StyleSheet, Text } from "react-native";

export default function Botao({ onPress, txt }){
    return(
        <TouchableOpacity style={style_Btn.btn} onPress={onPress}>
            <Text style={style_Btn.btnTxt}>{txt}</Text>
        </TouchableOpacity>
    );
}

const style_Btn = StyleSheet.create({
    btn:{
        width: "100%",
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#DC143C', // Carmesim vibrante
        marginTop: 20,
        marginBottom: 10,
        shadowColor: '#DC143C', // Sombra com a cor do botão
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
    btnTxt: {
        color: '#FFFFFF', // Texto em branco
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: "HankenGrotesk-Bold",
    }
});