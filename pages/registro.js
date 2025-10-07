import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Dimensions, Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Feather";
import Modal from "react-native-modal";

const { width } = Dimensions.get("window");

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Alert states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success"); // 'success', 'error', 'warning'
  const [scaleAnim] = useState(new Animated.Value(0));

  const API_URL = "http://192.168.56.1:8000/api";

  const alertIcons = {
    success: require("../assets/sucess.png"),
    error: require("../assets/error.png"),
    warning: require("../assets/warning.png"),
  };

  const borderColors = {
    success: "#8B0000",
    error: "#8B0000",
    warning: "#8B0000",
  };

  const backgroundColors = {
    success: "rgba(139, 0, 0, 0.15)",
    error: "rgba(139, 0, 0, 0.15)",
    warning: "rgba(139, 0, 0, 0.15)",
  };

  const showAlert = (type, title, message) => {
    setAlertType(type);
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
    scaleAnim.setValue(0);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 80,
      useNativeDriver: true,
    }).start();
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) return showAlert("error", "Erro", "Todos os campos são obrigatórios.");
    if (password.length < 8) return showAlert("error", "Erro", "A senha deve ter pelo menos 8 caracteres.");
    if (password !== confirmPassword) return showAlert("error", "Erro", "As senhas não coincidem.");

    try {
      const response = await fetch(`${API_URL}/registrar`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, password_confirmation: confirmPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.acess_token) await AsyncStorage.setItem("jwt", JSON.stringify(data.acess_token));
        showAlert("success", "Sucesso!", data.message || "Cadastro realizado com sucesso!");
        setTimeout(() => navigation.navigate("Login"), 2000);
      } else {
        const message = data.message || (data.errors ? Object.values(data.errors).flat().join("\n") : "Erro ao cadastrar.");
        showAlert("error", "Erro", message);
      }
    } catch (error) {
      console.log("Erro no cadastro:", error);
      showAlert("error", "Erro", "Não foi possível conectar ao servidor.");
    }
  };

  return (
    <LinearGradient colors={["#000000", "#1a0000", "#000000"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <View style={styles.container}>
        <View style={styles.brandSection}>
          <Image source={require("../assets/logo.png")} style={styles.logo} resizeMode="contain" />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.title}>Cadastre sua conta</Text>

          {/* Campos de input */}
          <View style={styles.inputWrapper}>
            <Icon name="user" size={20} color="#8B0000" style={styles.icon} />
            <TextInput style={styles.input} placeholder="Nome" placeholderTextColor="rgba(255,255,255,0.6)" value={name} onChangeText={setName} />
          </View>
          <View style={styles.inputWrapper}>
            <Icon name="mail" size={20} color="#8B0000" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="exemplo@stackhub.com"
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.inputWrapper}>
            <Icon name="lock" size={20} color="#8B0000" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              placeholderTextColor="rgba(255,255,255,0.6)"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon name={showPassword ? "eye-off" : "eye"} size={20} color="#8B0000" style={styles.togglePassword} />
            </TouchableOpacity>
          </View>
          <View style={styles.inputWrapper}>
            <Icon name="lock" size={20} color="#8B0000" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Confirme sua senha"
              placeholderTextColor="rgba(255,255,255,0.6)"
              secureTextEntry={!showPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon name={showPassword ? "eye-off" : "eye"} size={20} color="#8B0000" style={styles.togglePassword} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <LinearGradient
              colors={["#8B0000", "#600000"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>Cadastrar</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.registerText}>Já tem conta? Faça o login</Text>
          </TouchableOpacity>

          <View style={styles.divider} />
          <Text style={styles.footer}>© 2025 StackHub. Todos os direitos reservados.</Text>
        </View>
      </View>

      {/* SweetAlert2 Style Modal */}
      <Modal
        isVisible={alertVisible}
        onBackdropPress={() => setAlertVisible(false)}
        backdropOpacity={0.6}
        animationIn="zoomIn"
        animationOut="zoomOut"
        useNativeDriver
        backdropTransitionInTiming={400}
        backdropTransitionOutTiming={400}
      >
        <Animated.View style={[styles.alertContainer, { transform: [{ scale: scaleAnim }] }]}>
          <View style={[styles.alertContent, { borderLeftWidth: 5, borderLeftColor: borderColors[alertType] }]}>
            <View style={styles.alertHeader}>
              <View style={[styles.alertIconContainer, { backgroundColor: backgroundColors[alertType] }]}>
                <Image source={alertIcons[alertType]} style={styles.alertIcon} />
                <View style={[styles.alertGlow, { backgroundColor: borderColors[alertType] }]} />
              </View>
            </View>
           
            <View style={styles.alertBody}>
              <Text style={styles.alertTitle}>{alertTitle}</Text>
              <Text style={styles.alertMessage}>{alertMessage}</Text>
            </View>
           
            <TouchableOpacity
              style={[styles.alertButton, { backgroundColor: borderColors[alertType] }]}
              onPress={() => setAlertVisible(false)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[borderColors[alertType], darkenColor(borderColors[alertType])]}
                style={styles.alertButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.alertButtonText}>OK</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>
    </LinearGradient>
  );
}

// Função auxiliar para escurecer uma cor (para o gradiente do botão)
const darkenColor = (color) => {
  if (color === "#8B0000") return "#600000";
  return color;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0)",
    justifyContent: "center",
    padding: 15,
  },
  brandSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 220,
    height: 220,
    marginBottom: 10,
    tintColor: "#8B0000",
  },
  formSection: {
    backgroundColor: "rgba(20, 0, 0, 0.8)",
    borderRadius: 20,
    padding: 25,
    borderWidth: 1,
    borderColor: "#8B0000",
    shadowColor: "#8B0000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "HankenGrotesk-SemiBold",
    textAlign: "center",
    marginBottom: 20,
    textShadowColor: 'rgba(139, 0, 0, 0.75)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 30,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#8B0000",
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 45,
    fontFamily: "HankenGrotesk-SemiBold",
    color: "#FFFFFF",
  },
  togglePassword: {
    marginLeft: 8,
  },
  button: {
    borderRadius: 30,
    height: 45,
    marginBottom: 15,
    overflow: 'hidden',
  },
  gradientButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontFamily: "HankenGrotesk-SemiBold",
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  registerText: {
    color: "#fff",
    textAlign: "center",
    textDecorationLine: "underline",
    marginBottom: 20,
    fontFamily: "HankenGrotesk-SemiBold",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(139, 0, 0, 0.5)",
    marginVertical: 15,
  },
  footer: {
    color: "rgba(255, 193, 193, 0.6)",
    fontSize: 12,
    textAlign: "center",
    marginTop: 10,
    fontFamily: "HankenGrotesk-SemiBold",
  },
  // Estilos melhorados para o alerta no estilo SweetAlert2
  alertContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  alertContent: {
    backgroundColor: 'rgba(20, 0, 0, 0.95)',
    borderRadius: 20,
    padding: 0,
    width: width * 0.85,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: "#8B0000",
  },
  alertHeader: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 15,
  },
  alertIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  alertIcon: {
    width: 50,
    height: 50,
    zIndex: 2,
  },
  alertGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.3,
    filter: 'blur(15px)',
    zIndex: 1,
  },
  alertBody: {
    paddingHorizontal: 25,
    paddingBottom: 25,
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: 24,
    fontFamily: "HankenGrotesk-Bold",
    marginBottom: 15,
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  alertMessage: {
    fontSize: 16,
    fontFamily: "HankenGrotesk-Medium",
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 22,
  },
  alertButton: {
    borderRadius: 30,
    overflow: 'hidden',
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  alertButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: "HankenGrotesk-SemiBold",
  },
});