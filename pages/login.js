import React from "react";
import Container from "../components/container";
import Texto from "../components/text";
import Input from "../components/input";

export default function Login(){

    return(

        <Container>
        <Texto txt={"Login"} />
        <Input placeholder={"Digite seu Usuário"} placeholdercolor={"#fff"} />
        <Texto txt={"Senha"} />
        <Input placeholder={"Digite sua Senha"} placeholdercolor={"#fff"} />
        </Container>
    )
}