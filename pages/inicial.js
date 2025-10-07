import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  TextInput,
  Platform,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome, MaterialIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function Inicial({ navigation }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  // ✅ CORREÇÃO 1: Adicione o useRef para o carrossel
  const carouselRef = useRef(null); 

  const carouselItems = [
    {
      image: require('../assets/bannerguts.png'),
      title: "Guts - O Espadachim Negro",
      description: "Abrace as trevas e adquira já os colecionáveis do mais sombrio guerreiro dos animes."
    },
    {
      image: require('../assets/bannerdio.png'),
      title: "DIO - O Mestre do Tempo",
      description: "Controle o tempo com seu poderoso stand 'The World' e reine perante as terras."
    },
    {
      image: require('../assets/bannersungjiwoo.png'),
      title: "Sung Jiwoo - O Monarca das Sombras",
      description: "Seja o mais forte caçador e adquira já o Sung Jiwoo."
    }
  ];

  const features = [
    {
      icon: 'star',
      title: "Personagens Exclusivos",
      description: "Designs únicos criados por artistas renomados"
    },
    {
      icon: 'diamond',
      title: "Artefatos Lendários",
      description: "Itens colecionáveis com histórias ricas"
    },
    {
      icon: 'trophy',
      title: "Sistema de Ranqueamento",
      description: "Desafios semanais com recompensas exclusivas"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const nextSlide = (prev + 1) % carouselItems.length;
        // ✅ CORREÇÃO 2: Use o useRef para rolar o carrossel
        carouselRef.current?.scrollTo({ x: nextSlide * SCREEN_WIDTH, animated: true });
        return nextSlide;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [carouselItems.length]); // Inclua a dependência

  const nextSlide = () => {
    setCurrentSlide((prev) => {
      const nextIndex = (prev + 1) % carouselItems.length;
      carouselRef.current?.scrollTo({ x: nextIndex * SCREEN_WIDTH, animated: true });
      return nextIndex;
    });
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => {
      const prevIndex = (prev - 1 + carouselItems.length) % carouselItems.length;
      carouselRef.current?.scrollTo({ x: prevIndex * SCREEN_WIDTH, animated: true });
      return prevIndex;
    });
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    carouselRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
  };
  
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [100, 70],
    extrapolate: 'clamp'
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0.9],
    extrapolate: 'clamp'
  });
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <Animated.View style={[styles.header, { height: headerHeight, opacity: headerOpacity }]}>
        <View style={styles.headerContainer}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../assets/CRIMSON_START.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>CRIMSON STAR</Text>
          </View>
          
          <View style={styles.navContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.navScroll}>
              <TouchableOpacity style={styles.navLink}>
                <Text style={styles.navText}>Início</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navLink} onPress={() => navigation.navigate('Moda')}>
                <Text style={styles.navText}>Modal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navLink} onPress={() => navigation.navigate('Contact')}>
                <Text style={styles.navText}>Flatlist</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navLink}>
                <Text style={styles.navText}>Newsletter</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navLink} onPress={() => navigation.navigate('ItensCRUD')}>
                <Text style={styles.navText}>Ver itens</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navLink} onPress={() => navigation.navigate('CadastroItem')}>
                <Text style={styles.navText}>Cadastrar Item</Text>
              </TouchableOpacity>
            </ScrollView>
            
            {/* 🚀 Botão para voltar ao login.js */}
            <TouchableOpacity 
              style={[styles.ctaButton, { backgroundColor: '#FF2400', marginRight: 12 }]} 
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.ctaButtonText}>Sair</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.ctaButton}>
              <Text style={styles.ctaButtonText}>Cadastre-se</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.mobileMenuBtn}>
              <Ionicons name="menu" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      <ScrollView 
        style={styles.scrollView}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Section */}
        <View style={styles.hero} id="hero">
          <LinearGradient
            colors={['#1a1a2e', '#16213e', '#0f3460']}
            style={styles.heroGradient}
          >
            <View style={styles.heroContainer}>
              <Image 
                source={require('../assets/CRIMSON_TRANS.png')} 
                style={styles.heroImage}
                resizeMode="contain"
              />
              <View style={styles.heroContent}>
                <Text style={styles.heroTitle}>
                  Explore o universo <Text style={styles.heroTitleAccent}>Crimson Star</Text>
                </Text>
                <Text style={styles.heroDescription}>
                  Descubra personagens exclusivos e artefatos lendários em uma experiência de coleção premium. 
                  Junte-se a milhares de fãs de anime nessa jornada épica.
                </Text>
                <View style={styles.heroButtons}>
                  <TouchableOpacity style={[styles.button, styles.primaryButton]}>
                    <Text style={styles.buttonText}>Comece Agora</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.button, styles.outlineButton]}>
                    <Text style={[styles.buttonText, styles.outlineButtonText]}>Saiba Mais</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Collection Section */}
        <View style={styles.section} id="colecao">
          <View style={styles.container}>
            <View style={styles.sectionTitle}>
              <Text style={styles.sectionTitleText}>
                Personagens <Text style={styles.sectionTitleAccent}>em Destaque</Text>
              </Text>
              <Text style={styles.sectionSubtitle}>
                Conheça os guerreiros mais poderosos do nosso universo
              </Text>
            </View>
            
            <View style={styles.carouselContainer}>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                  const slideIndex = Math.round(
                    event.nativeEvent.contentOffset.x / SCREEN_WIDTH
                  );
                  setCurrentSlide(slideIndex);
                }}
                // ✅ CORREÇÃO 3: Passe a referência do useRef para o ref do ScrollView
                ref={carouselRef}
                style={styles.carousel}
              >
                {carouselItems.map((item, index) => (
                  <View key={index} style={styles.carouselItem}>
                    <Image 
                      source={item.image} 
                      style={styles.carouselImage}
                      resizeMode="cover"
                    />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.8)']}
                      style={styles.carouselGradient}
                    >
                      <View style={styles.carouselContent}>
                        <Text style={styles.carouselTitle}>{item.title}</Text>
                        <Text style={styles.carouselDescription}>{item.description}</Text>
                        <TouchableOpacity style={[styles.button, styles.outlineButton, { marginTop: 16 }]}>
                          <Text style={[styles.buttonText, styles.outlineButtonText]}>Ver Detalhes</Text>
                        </TouchableOpacity>
                      </View>
                    </LinearGradient>
                  </View>
                ))}
              </ScrollView>
              
              <View style={styles.carouselControls}>
                <TouchableOpacity style={styles.carouselButton} onPress={prevSlide}>
                  <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.carouselButton} onPress={nextSlide}>
                  <Ionicons name="chevron-forward" size={24} color="white" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.indicators}>
                {carouselItems.map((_, index) => (
                  <TouchableOpacity 
                    key={index}
                    style={[
                      styles.indicator,
                      index === currentSlide && styles.indicatorActive
                    ]}
                    onPress={() => goToSlide(index)}
                  />
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.aboutSection} id="sobre">
          <LinearGradient
            colors={['#0f3460', '#16213e', '#1a1a2e']}
            style={styles.aboutGradient}
          >
            <View style={styles.aboutContainer}>
              <Image 
                source={require('../assets/aboutpic.jpg')} 
                style={styles.aboutImage}
                resizeMode="cover"
              />
              <View style={styles.aboutContent}>
                <Text style={styles.aboutTitle}>
                  Sobre o <Text style={styles.aboutTitleAccent}>Crimson Star</Text>
                </Text>
                <Text style={styles.aboutDescription}>
                  Crimson Star é mais que uma plataforma de coleção - é um universo vibrante onde cada 
                  personagem tem uma história para contar. Nossa missão é trazer a magia do anime para 
                  colecionadores exigentes.
                </Text>
                <Text style={styles.aboutDescription}>
                  Com ilustrações premium e lore detalhada, oferecemos uma experiência imersiva para 
                  fãs de anime e colecionadores.
                </Text>
                
                <View style={styles.features}>
                  {features.map((feature, index) => (
                    <View key={index} style={styles.feature}>
                      <View style={styles.featureIcon}>
                        <FontAwesome name={feature.icon} size={20} color="#e94560" />
                      </View>
                      <View style={styles.featureText}>
                        <Text style={styles.featureTitle}>{feature.title}</Text>
                        <Text style={styles.featureDescription}>{feature.description}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Newsletter Section */}
        <View style={styles.newsletterSection} id="newsletter">
          <LinearGradient
            colors={['#1a1a2e', '#16213e']}
            style={styles.newsletterGradient}
          >
            <View style={styles.container}>
              <View style={styles.sectionTitle}>
                <Text style={styles.sectionTitleText}>
                  Junte-se à <Text style={styles.sectionTitleAccent}>Comunidade</Text>
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Receba atualizações exclusivas e ofertas especiais diretamente no seu e-mail
                </Text>
              </View>
              
              <View style={styles.newsletterForm}>
                <TextInput
                  style={styles.newsletterInput}
                  placeholder="Seu melhor e-mail"
                  placeholderTextColor="#888"
                  keyboardType="email-address"
                />
                <TouchableOpacity style={[styles.button, styles.primaryButton]}>
                  <Text style={styles.buttonText}>Assinar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <LinearGradient
            colors={['#0f0c29', '#24243e', '#302b63']}
            style={styles.footerGradient}
          >
            <View style={styles.container}>
              <View style={styles.footerContainer}>
                <View style={styles.footerColumn}>
                  <Text style={styles.footerColumnTitle}>Explorar</Text>
                  <TouchableOpacity style={styles.footerLink}>
                    <Text style={styles.footerLinkText}>Início</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.footerLink}>
                    <Text style={styles.footerLinkText}>Coleção</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.footerLink}>
                    <Text style={styles.footerLinkText}>Sobre Nós</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.footerLink}>
                    <Text style={styles.footerLinkText}>Newsletter</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.footerColumn}>
                  <Text style={styles.footerColumnTitle}>Recursos</Text>
                  <TouchableOpacity style={styles.footerLink}>
                    <Text style={styles.footerLinkText}>Galeria</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.footerLink}>
                    <Text style={styles.footerLinkText}>Eventos</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.footerLink}>
                    <Text style={styles.footerLinkText}>Ranking</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.footerLink}>
                    <Text style={styles.footerLinkText}>Blog</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.footerColumn}>
                  <Text style={styles.footerColumnTitle}>Contato</Text>
                  <View style={styles.contactItem}>
                    <Ionicons name="mail" size={16} color="#e94560" />
                    <Text style={styles.contactText}>contato@crimsonstar.com</Text>
                  </View>
                  <View style={styles.contactItem}>
                    <Ionicons name="call" size={16} color="#e94560" />
                    <Text style={styles.contactText}>+55 11 99999-9999</Text>
                  </View>
                  
                  <View style={styles.socialLinks}>
                    <TouchableOpacity style={styles.socialLink}>
                      <FontAwesome name="facebook-f" size={16} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialLink}>
                      <FontAwesome name="twitter" size={16} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialLink}>
                      <FontAwesome name="instagram" size={16} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialLink}>
                      <FontAwesome name="discord" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              
              <View style={styles.footerBottom}>
                <Text style={styles.footerBottomText}>
                  © 2025 Crimson Star. Todos os direitos reservados.
                </Text>
                <View style={styles.footerLegal}>
                  <TouchableOpacity>
                    <Text style={styles.footerLegalLink}>Termos de Serviço</Text>
                  </TouchableOpacity>
                  <Text style={styles.footerLegalSeparator}>|</Text>
                  <TouchableOpacity>
                    <Text style={styles.footerLegalLink}>Política de Privacidade</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0c29',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: 'rgba(15, 12, 41, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(233, 69, 96, 0.3)',
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
  },
  headerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  logoText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  navContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navScroll: {
    maxHeight: 40,
  },
  navLink: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  navText: {
    color: 'white',
    fontSize: 14,
  },
  ctaButton: {
    backgroundColor: '#e94560',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 12,
  },
  ctaButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  mobileMenuBtn: {
    display: 'none',
    marginLeft: 12,
  },
  hero: {
    minHeight: SCREEN_HEIGHT,
  },
  heroGradient: {
    flex: 1,
    paddingTop: 100,
  },
  heroContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  heroImage: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
    marginBottom: 30,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  heroTitleAccent: {
    color: '#e94560',
  },
  heroDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  heroButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginHorizontal: 8,
    marginVertical: 8,
  },
  primaryButton: {
    backgroundColor: '#e94560',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e94560',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  outlineButtonText: {
    color: '#e94560',
  },
  section: {
    paddingVertical: 60,
  },
  sectionTitle: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  sectionTitleText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionTitleAccent: {
    color: '#e94560',
  },
  sectionSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    textAlign: 'center',
  },
  carouselContainer: {
    height: SCREEN_WIDTH * 0.7,
    position: 'relative',
  },
  carousel: {
    flex: 1,
  },
  carouselItem: {
    width: SCREEN_WIDTH,
    height: '100%',
    position: 'relative',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  carouselGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    justifyContent: 'flex-end',
    padding: 20,
  },
  carouselContent: {
    maxWidth: '80%',
  },
  carouselTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  carouselDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
  carouselControls: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    transform: [{ translateY: -20 }],
  },
  carouselButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  indicatorActive: {
    backgroundColor: '#e94560',
    width: 16,
  },
  aboutSection: {
    paddingVertical: 60,
  },
  aboutGradient: {
    paddingVertical: 40,
  },
  aboutContainer: {
    flexDirection: 'column',
    paddingHorizontal: 20,
  },
  aboutImage: {
    width: '100%',
    height: SCREEN_WIDTH * 0.6,
    borderRadius: 12,
    marginBottom: 30,
  },
  aboutContent: {
    paddingHorizontal: 10,
  },
  aboutTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  aboutTitleAccent: {
    color: '#e94560',
  },
  aboutDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  features: {
    marginTop: 30,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(233, 69, 96, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featureDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  newsletterSection: {
    paddingVertical: 60,
  },
  newsletterGradient: {
    paddingVertical: 40,
  },
  newsletterForm: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  newsletterInput: {
    flex: 1,
    backgroundColor: 'white',
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 20,
    marginRight: 10,
  },
  footer: {
    paddingTop: 40,
  },
  footerGradient: {
    paddingVertical: 40,
  },
  footerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  footerColumn: {
    width: '30%',
    minWidth: 150,
    marginBottom: 30,
  },
  footerColumnTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  footerLink: {
    marginBottom: 8,
  },
  footerLinkText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 8,
  },
  socialLinks: {
    flexDirection: 'row',
    marginTop: 16,
  },
  socialLink: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  footerBottom: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  footerBottomText: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 8,
  },
  footerLegal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerLegalLink: {
    color: '#e94560',
  },
  footerLegalSeparator: {
    color: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 8,
  },
});