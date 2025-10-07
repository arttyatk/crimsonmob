import React, { useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function Splashscreen() {
    const navigation = useNavigation();

    useEffect(() => {
        const timer = setTimeout(() => {
            // 🚀 Corrigido: Redireciona para a tela de 'Login' após 3 segundos.
            navigation.navigate("Login"); 
        }, 3000)

        return () => clearTimeout(timer);
    }, [navigation])

    return (
        <View style={styles.container}>
            <Image
                source={require("../assets/CRIMSON_TRANS.png")}
                style={styles.image}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ffff",
    },
    image: {
        width: "100%",
        resizeMode: "contain"
    }
});