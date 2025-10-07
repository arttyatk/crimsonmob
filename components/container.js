import React from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

export default function Container({ children }){
    return(
        <LinearGradient
            colors={['#1A1A1A', '#333333', '#1A1A1A']} // Cores do gradiente
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={style_Container.cont}
        >
            {children}
        </LinearGradient>
    )
}

const style_Container = StyleSheet.create({
    cont:{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    }
});