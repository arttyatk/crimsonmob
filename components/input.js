import React from "react";
import { TextInput, StyleSheet } from "react-native";

export default function Input({ placeholder, value, onChangeText, ...rest }){
    return(
        <TextInput 
            style={style_input.input} 
            placeholder={placeholder} 
            placeholderTextColor={"#A0AEC0"} // Cor para o placeholder
            value={value} 
            onChangeText={onChangeText} 
            {...rest}
        />
    );
}

const style_input = StyleSheet.create({
    input:{
        width:"100%",
        padding: 15,
        borderRadius: 12, // Bordas mais suaves
        backgroundColor: '#333333', // Fundo escuro
        borderColor: '#555555', // Borda sutil
        borderWidth: 1,
        color: '#F0F0F0', // Cor do texto
        fontSize: 16,
        marginBottom: 10,
    }
});