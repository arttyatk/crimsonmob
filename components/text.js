import React from "react";
import { Text, StyleSheet } from "react-native";


export default function Texto({txt}){

    return(

        <Text style={style_txt.txt}>{txt}</Text>
    )
}


const style_txt = StyleSheet.create({

    txt:{

        fontSize:20,
        color:"white",
        marginLeft:10,
        marginBottom:10,
    }

})