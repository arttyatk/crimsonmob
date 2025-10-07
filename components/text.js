import React from "react";
import { Text, StyleSheet } from "react-native";

export default function Texto({ txt, style }){
    return(
        <Text style={[style_txt.txt, style]}>{txt}</Text>
    );
}

const style_txt = StyleSheet.create({
    txt:{
        fontSize: 20,
        color: "#F0F0F0", // Cinza claro para combinar com a paleta
        fontFamily: "HankenGrotesk-SemiBold",
    }
});