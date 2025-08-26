import React from "react";
import { TextInput, StyleSheet } from "react-native";


export default function Input({placeholder, Placeholdercolor,...rest}){

    return(

        <TextInput style={style_input.input} placeholder={placeholder} placeholderTextColor={Placeholdercolor}/>

    )
}

const style_input = StyleSheet.create({

    input:{
        width:"90%",
        height:40,
        borderColor:"white",
        borderBlockEndColor:"white",
        marginLeft:20,
        marginTop:10,
        marginBottom:10,
        borderWidth:1,
        borderRadius:2,
    }
})