import React, { Children } from "react";
import {View, StyleSheet} from "react-native";

export default function Container({children}){

    return(

        <View style={style_Container.cont}>{children}</View>
    )
}


const style_Container = StyleSheet.create({

    cont:{

        flex:1,
        justifyContent:"center",
        alignItems:"center",
        backgroundColor:"crimson",
    }

})