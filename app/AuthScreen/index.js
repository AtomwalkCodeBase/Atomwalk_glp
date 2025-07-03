import React, { useEffect, useState } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  StatusBar, 
  SafeAreaView, 
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Dimensions,
  Keyboard,
  Image
} from 'react-native';
import { FontAwesome, Ionicons, MaterialIcons, Entypo } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Logos from '../../assets/images/Atom_walk_logo.jpg'
import styled from 'styled-components/native';
import { useRouter } from 'expo-router';
import { loginURL } from '../../src/services/ConstantServies';
import axios from 'axios';
import { getCompanyInfo } from '../../src/services/authServices';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { publicAxiosRequest } from '../../src/services/HttpMethod';
import Constants from 'expo-constants';

const { width, height } = Dimensions.get('window');

// Responsive scaling functions
const scaleWidth = (size) => (width / 375) * size;
const scaleHeight = (size) => (height / 812) * size;

const LoginScreen = () => { 
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [userPin, setUserPin] = useState(null);
    const [profileName, setProfileName] = useState('');
    const [company, setCompany] = useState({ image: Logos });
    const [keyboardStatus, setKeyboardStatus] = useState(false);
    const isLoginDisabled = !username || !password;
    // const isFormValid = username.trim() !== '' && password.trim() !== '';
    const appVersion = Constants.expoConfig?.version || '0.0.1';



    useEffect(() => {
      const loadSavedUsername = async () => {
          try {
              const savedUsername = await AsyncStorage.getItem('username');
              if (savedUsername) {
                  setUsername(savedUsername);
              }

              const storedName = await AsyncStorage.getItem('profilename');
              if (storedName) {
                  setProfileName(storedName);
              } else {
                  const profileData = await AsyncStorage.getItem('profile');
                  if (profileData) {
                      const parsedProfile = JSON.parse(profileData);
                      setProfileName(parsedProfile?.emp_data?.name || '');
                  }
              }
          } catch (error) {
              console.error('Error loading saved data:', error);
          }
      };

      loadSavedUsername();
  }, []);
  useEffect(() => {
    const fetchUserPin = async () => {
        const storedPin = await AsyncStorage.getItem('userPin');
        setUserPin(storedPin); // storedPin will be `null` if no value is found
    };
    fetchUserPin();
}, []);

useEffect(() => {
  const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardStatus(true)
  );
  const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardStatus(false)
  );

  return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
  };
}, []);

    const validateInput = () => {
        if (!username) {
            setErrorMessage('Username is required');
            return false;
        }
        if (!password) {
            setErrorMessage('Password is required');
            return false;
        }
        if (password.length < 6) {
            setErrorMessage('Password must be at least 6 characters long');
            return false;
        }
        setErrorMessage('');
        return true;
    };

    const handlePressPassword = () => {
        router.push({
            pathname: 'PinScreen' 
        });
    };

    const handlePress = async () => {
        if (!validateInput()) {
            return;
        } 
        let finalUsername = username;
    
        if (!username.includes('@')) {
            try {
                const userDetailResponse = await axios.get(`https://www.atomwalk.com/api/get_user_detail/?user_id=${username}`);  
                if (userDetailResponse.status === 200) {
                    finalUsername = userDetailResponse.data.username;
                } else {
                    setErrorMessage('User not found');
                    return;
                }
            } catch (error) {
                console.error('Error fetching username:', error);
                setErrorMessage('Failed to retrieve user details');
                return;
            }
        }
    
        try {
            const response = await publicAxiosRequest.post(loginURL, {
                username: finalUsername,
                password: password,
            });
    
            if (response.status === 200) {
                AsyncStorage.setItem('Password', password);
                AsyncStorage.setItem('username', finalUsername);
                getCompanyInfo().then((res) => {
                    let comanyInfo = res.data; 
                    AsyncStorage.setItem('companyInfo', JSON.stringify(comanyInfo));
                    let db_name = comanyInfo.db_name.substr(3)
                    AsyncStorage.setItem('dbName', db_name);
                })
                .catch((error) => {
                    console.log('ERROR', {error}, error.message);
                });

                const userToken = response.data['key'];
                await AsyncStorage.setItem('userToken', userToken);
                router.push('/home');
            } else {
                setErrorMessage('Invalid User id or Password');
            }
        } catch (error) {
            // console.error('API call error:', error);
            setErrorMessage('Invalid User id or Password');
        }
    };

    return (
      <SafeAreaContainer>
      <StatusBar barStyle="light-content" backgroundColor="#5ed2ce" />
          <Container>
            <Header style={styles.headerContainer}>
              <LinearGradient 
                colors={['#5ed2ce', '#b2ebe8']} 
                start={[0.5, 0]} 
                end={[0.5, 1]}
                style={styles.headerGradient}
              >
                <View style={styles.headerTop}>
                  
                  
                  <View style={styles.logoContainer}>
                                      {Logos ? (
                                      <Image source={Logos} style={styles.logo} />
                                      ) : (
                                      <View style={styles.companyPlaceholder}>
                                          <MaterialIcons name="business" size={scaleWidth(40)} color="#fff" />
                                      </View>
                                      )}
                                  </View>
                  {profileName && (
                    <WelcomeContainer>
                      <GreetingText>Welcome back,</GreetingText>
                      <UserNameText>{profileName}</UserNameText>
                    </WelcomeContainer>
                  )}
                </View>
              </LinearGradient>
            </Header>
            <MainContent keyboardStatus={keyboardStatus}>
            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
                <Content>
                  <Card>
                    <Title>Login</Title>
                    
                    <InputContainer>
                      <InputLabel>Enter your User ID / Mobile Number</InputLabel>
                      <InputWrapper>
                        <Input
                          placeholder="User ID / Mobile Number"
                          value={username}
                          onChangeText={setUsername}
                          placeholderTextColor="#999"
                          autoCapitalize="none"
                        />
                      </InputWrapper>

                      <InputLabel>Enter your Password</InputLabel>
                      <InputWrapper>
                        <Input
                          placeholder="Password"
                          value={password}
                          onChangeText={setPassword}
                          secureTextEntry={!isPasswordVisible}
                          placeholderTextColor="#999"
                        />
                        <EyeButton onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                          <Ionicons
                            name={isPasswordVisible ? 'eye-off' : 'eye'}
                            size={scaleWidth(20)}
                            color="#666"
                          />
                        </EyeButton>
                      </InputWrapper>
                      
                      {errorMessage ? <ErrorText>{errorMessage}</ErrorText> : null}
                      
                      <LoginButton 
                        onPress={handlePress}
                        disabled={isLoginDisabled}
                        style={{ backgroundColor: isLoginDisabled ? '#fff' : '#007AFF' }}
                      >
                        <LoginButtonText style={{ color: isLoginDisabled ? '#3333' : '#fff' }}>
                          LOGIN
                        </LoginButtonText>
                      </LoginButton>

                    </InputContainer>
                  </Card>

                  {userPin&&<AlternativeLogin onPress={handlePressPassword}>
                    <FingerprintIcon>
                      <Entypo name="fingerprint" size={scaleWidth(24)} color="#fff" />
                    </FingerprintIcon>
                    <AlternativeLoginText>Login with PIN/Fingerprint</AlternativeLoginText>
                  </AlternativeLogin>
                  }
                </Content>
                </ScrollView>
                </MainContent>

            <Footer style={styles.fixedFooter}>
              <FooterText>Version Code: {appVersion}</FooterText>
            </Footer>
          </Container>
        {/* </KeyboardAvoidingView> */}
      </SafeAreaContainer>
    );
};

const styles = StyleSheet.create({
  headerContainer: {
    overflow: 'visible',
    zIndex: 10,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + scaleHeight(10) : scaleHeight(10),
    paddingHorizontal: scaleWidth(20),
    paddingBottom: scaleHeight(20),
    borderBottomLeftRadius: scaleWidth(30),
    borderBottomRightRadius: scaleWidth(30),
  },
  headerTop: {
    paddingVertical: scaleHeight(10),
  },
  companySection: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scaleHeight(20),
  },

  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    borderRadius: scaleWidth(10),
    overflow: 'hidden'
},

logo: {
    width: scaleWidth(150),
    height: scaleHeight(60),
    borderRadius: scaleWidth(10),
    resizeMode: 'contain',
    backgroundColor: '#fff',
},
  companyPlaceholder: {
    width: scaleWidth(80),
    height: scaleWidth(80),
    borderRadius: scaleWidth(40),
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    flex: 1,
    position: 'relative', // Needed for absolute positioning of footer
  },
  fixedFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: scaleHeight(80), // Add padding to prevent content from being hidden behind footer
  },
  hiddenFooter: {
    display: 'none',
  },
  visibleFooter: {
    padding: scaleHeight(15),
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    width: '100%',
  },

});

const SafeAreaContainer = styled(SafeAreaView)`
  flex: 1;
  background-color: #a970ff;
`;

const Container = styled.View`
  flex: 1;
  background-color: #f8fffe;
`;

const Header = styled.View`
  background-color: transparent;
`;

const ContentContainer = styled.View`
  flex: 1;
  margin-top: ${scaleHeight(-40)}px;
`;

const Content = styled.View`
  padding: ${scaleWidth(20)}px;
  padding-bottom: ${scaleHeight(80)}px;
`;

const Logo = styled.Image`
  width: ${scaleWidth(150)}px;
  height: ${scaleHeight(60)}px;
  border-radius: ${scaleWidth(10)}px;
  resize-mode: contain;
`;

const Card = styled.View`
  background-color: #fff;
  border-radius: ${scaleWidth(10)}px;
  margin-top: ${scaleHeight(50)}px;
  padding: ${scaleWidth(20)}px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

const Title = styled.Text`
  font-size: ${scaleWidth(22)}px;
  font-weight: bold;
  color: #333;
  margin-bottom: ${scaleHeight(25)}px;
  text-align: center;
`;

const InputContainer = styled.View`
  width: 100%;
`;

const InputLabel = styled.Text`
  font-size: ${scaleWidth(14)}px;
  color: #666;
  margin-bottom: ${scaleHeight(5)}px;
  font-weight: 500;
`;

const InputWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: #f9f9f9;
  border-radius: ${scaleWidth(5)}px;
  border: 1px solid #ddd;
  margin-bottom: ${scaleHeight(15)}px;
  padding: 0 ${scaleWidth(15)}px;
  height: ${scaleHeight(50)}px;
`;

const Input = styled.TextInput`
  flex: 1;
  color: #333;
  font-size: ${scaleWidth(16)}px;
`;

const EyeButton = styled.TouchableOpacity`
  padding: ${scaleWidth(5)}px;
`;

const ErrorText = styled.Text`
  color: #e74c3c;
  font-size: ${scaleWidth(14)}px;
  margin-bottom: ${scaleHeight(15)}px;
`;

const LoginButton = styled.TouchableOpacity`
  background-color: ${props => props.disabled ? '#fff' : '#007AFF'};
  border: 1px solid rgb(207, 214, 221);
  padding: ${scaleHeight(15)}px;
  border-radius: ${scaleWidth(5)}px;
  align-items: center;
  margin-top: ${scaleHeight(10)}px;
`;


const LoginButtonText = styled.Text`
  color: #fff;
  font-size: ${scaleWidth(16)}px;
  font-weight: bold;
`;

const WelcomeContainer = styled.View`
  margin-bottom: ${scaleHeight(20)}px;
  align-items: center;
`;

const GreetingText = styled.Text`
  color: rgba(255, 255, 255, 0.9);
  font-size: ${scaleWidth(16)}px;
  font-weight: 500;
`;

const UserNameText = styled.Text`
  color: #fff;
  font-size: ${scaleWidth(24)}px;
  font-weight: bold;
  margin-top: ${scaleHeight(3)}px;
`;

const AlternativeLogin = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-top: ${scaleHeight(30)}px;
`;

const FingerprintIcon = styled.View`
  background-color: #a970ff;
  width: ${scaleWidth(40)}px;
  height: ${scaleWidth(40)}px;
  border-radius: ${scaleWidth(20)}px;
  align-items: center;
  justify-content: center;
  margin-right: ${scaleWidth(10)}px;
`;

const AlternativeLoginText = styled.Text`
  color: #a970ff;
  font-size: ${scaleWidth(16)}px;
  font-weight: 500;
`;
const MainContent = styled.View`
  flex: 1;
  margin-bottom: ${props => props.keyboardStatus ? 0 : scaleHeight(60)}px;
`;
const Footer = styled.View`
  padding: ${scaleHeight(10)}px;
  align-items: center;
  justify-content: center;
  border-top-width: 1px;
  border-top-color: #eee;
  background-color: #fff;
  width: 100%;
`;

const FooterText = styled.Text`
  color:#088f8f;
  font-size: ${scaleWidth(14)}px;
  font-weight: 500;
`;

export default LoginScreen;