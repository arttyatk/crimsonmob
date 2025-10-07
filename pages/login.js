import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Modal, Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Feather";

// Componente de Alert personalizado
const CustomAlert = ({ visible, title, message, onClose, type = "error" }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  const backgroundColor = type === "success" ? "#0a3d1d" : "#450000";
  const borderColor = type === "success" ? "#1ab617" : "#8B0000";
  const iconName = type === "success" ? "check-circle" : "alert-circle";
  const iconColor = type === "success" ? "#1ab617" : "#FF2400";

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={alertStyles.overlay}>
        <Animated.View 
          style={[
            alertStyles.alertContainer,
            { 
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
              backgroundColor,
              borderColor 
            }
          ]}
        >
          <View style={alertStyles.iconContainer}>
            <Icon name={iconName} size={40} color={iconColor} />
          </View>
          <Text style={alertStyles.alertTitle}>{title}</Text>
          <Text style={alertStyles.alertMessage}>{message}</Text>
          <TouchableOpacity 
            style={[alertStyles.alertButton, { backgroundColor: borderColor }]} 
            onPress={onClose}
          >
            <Text style={alertStyles.alertButtonText}>Entendido</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Estilos para o alert personalizado
const alertStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  alertContainer: {
    width: 300,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    alignItems: "center",
    shadowColor: "#FF0000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 15,
  },
  alertTitle: {
    color: "#FFD700",
    fontSize: 20,
    fontFamily: "HankenGrotesk-SemiBold",
    textAlign: "center",
    marginBottom: 10,
    textShadowColor: 'rgba(255, 0, 0, 0.75)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 5,
  },
  alertMessage: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "HankenGrotesk-SemiBold",
    textAlign: "center",
    marginBottom: 20,
  },
  alertButton: {
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 25,
  },
  alertButtonText: {
    color: "#FFFFFF",
    fontFamily: "HankenGrotesk-SemiBold",
    fontSize: 16,
  },
});

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("error");

  const API_URL = "http://192.168.56.1:8000/api";

  React.useEffect(() => {
    // Animação de pulsação para o logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const showCustomAlert = (title, message, type = "error") => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  const handleLogin = async () => {
    // Validação de email e senha
    if (!email) {
      showCustomAlert("Erro", "O email é obrigatório");
      return;
    }
    if (!password || password.length < 8) {
      showCustomAlert("Erro", "A senha deve ter pelo menos 8 caracteres");
      return;
    }

    // Exibindo os valores para debugar
    console.log("Email:", email); 
    console.log("Senha:", password);

    try {
      // Requisição para o backend
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      // Pegando a resposta da API
      const data = await response.json();

      // Exibindo a resposta da API para debugar
      console.log("Resposta da API:", data); 

      // Verificando se a resposta é OK e se existe o token
      if (response.ok && data.acess_token) {
        await AsyncStorage.setItem("jwt", JSON.stringify(data.acess_token));
        showCustomAlert("Sucesso", "Login realizado com sucesso!", "success");
        setTimeout(() => {
          setAlertVisible(false);
          navigation.navigate("Inicial");
        }, 1500);
      } else {
        // Se o login falhar, exibe a mensagem de erro da API
        showCustomAlert("Erro", data.message || "Falha no login. Verifique as credenciais.");
      }
    } catch (error) {
      console.log("Erro na requisição:", error);
      showCustomAlert("Erro", "Não foi possível conectar ao servidor.");
    }
  };

  const logoScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05]
  });

  return (
    <LinearGradient
      colors={["#8B0000", "#450000", "#000000"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <View style={styles.container}>
        {/* Logo com animação */}
        <View style={styles.brandSection}>
          <Animated.View style={{ transform: [{ scale: logoScale }] }}>
            <Image
              source={require("../assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        {/* Efeito de partículas (simulado) */}
        <View style={styles.particlesContainer}>
          {[...Array(15)].map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.particle, 
                { 
                  left: `${Math.random() * 100}%`, 
                  top: `${Math.random() * 100}%`,
                  width: Math.random() * 5 + 2,
                  height: Math.random() * 5 + 2,
                  opacity: Math.random() * 0.5 + 0.3,
                }
              ]} 
            />
          ))}
        </View>

        {/* Card de login */}
        <View style={styles.formSection}>
          <Text style={styles.title}>Acesse o Universo</Text>
          
          {/* Subtítulo estilizado */}
          <Text style={styles.subtitle}>Entre no mundo de aventuras</Text>

          {/* Email */}
          <View style={styles.inputWrapper}>
            <Icon name="mail" size={20} color="#ff0000ff" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="exemplo@crimsonstar.com"
              placeholderTextColor="#ff0000ff"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Senha */}
          <View style={styles.inputWrapper}>
            <Icon name="lock" size={20} color="#ff0000ff" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              placeholderTextColor="#ff0000ff"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="#ffffffff"
                style={styles.togglePassword}
              />
            </TouchableOpacity>
          </View>

          {/* Esqueci senha */}
          <TouchableOpacity>
            <Text style={styles.forgotPassword}>Esqueci minha senha</Text>
          </TouchableOpacity>

          {/* Botão login */}
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <LinearGradient
              colors={["#FF2400", "#8B0000"]}
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>Login</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Cadastro */}
          <TouchableOpacity onPress={() => navigation.navigate("RegisterScreen")}>
            <Text style={styles.registerText}>
              Novo guerreiro? <Text style={styles.registerHighlight}>Junte-se a nós</Text>
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Social login */}
          <Text style={styles.socialText}>Ou conecte-se com:</Text>
          <View style={styles.socialLogin}>
            <TouchableOpacity style={styles.socialBtn}>
              <Icon name="github" size={20} color="#ffffffff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
              <Icon name="facebook" size={20} color="#ffffffff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
              <Icon name="twitter" size={20} color="#ffffffff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>
            © 2025 Crimson Animeverse. Todos os direitos reservados.
          </Text>
        </View>
      </View>

      {/* Alert personalizado */}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertVisible(false)}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0)",
    justifyContent: "center",
    padding: 15,
    width: "100%",
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  particle: {
    position: 'absolute',
    backgroundColor: '#f7f7f7ff',
    borderRadius: 50,
  },
  brandSection: {
    alignItems: "center",
    marginBottom: 20,
    zIndex: 1,
  },
  logo: {
    width: 220,
    height: 220,
    marginBottom: 10,
    tintColor: '#e83131ff',
  },
  formSection: {
    backgroundColor: "rgba(35, 0, 0, 0.8)",
    borderRadius: 20,
    padding: 25,
    borderWidth: 1,
    borderColor: "#8B0000",
    shadowColor: "#FF0000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 1,
    width: "100%",
  },
  title: {
    color: "#ffffffff",
    fontSize: 24,
    fontFamily: "HankenGrotesk-SemiBold",
    textAlign: "center",
    marginBottom: 5,
    textShadowColor: 'rgba(255, 0, 0, 0.75)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 10,
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    fontFamily: "HankenGrotesk-SemiBold",
    textAlign: "center",
    marginBottom: 20,
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
  forgotPassword: {
    color: "#ff1111ff",
    textAlign: "right",
    textDecorationLine: "underline",
    marginBottom: 15,
    fontFamily: "HankenGrotesk-SemiBold",
    fontSize: 12,
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
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "HankenGrotesk-SemiBold",
    fontSize: 14,
  },
  registerHighlight: {
    color: "#ffffffff",
    textDecorationLine: "underline",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(139, 0, 0, 0.5)",
    marginVertical: 15,
  },
  socialText: {
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginBottom: 10,
    fontFamily: "HankenGrotesk-SemiBold",
    fontSize: 12,
  },
  socialLogin: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
  },
  socialBtn: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: "rgba(139, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#000000ff",
  },
  footer: {
    color: "rgba(255, 193, 193, 0.6)",
    fontSize: 10,
    textAlign: "center",
    marginTop: 10,
    fontFamily: "HankenGrotesk-SemiBold",
  },
});