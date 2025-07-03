import React, { useContext, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import styled from 'styled-components/native';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { AppContext } from '../../context/AppContext';
import { getProfileInfo } from '../services/authServices';
import { useNavigation, useRouter } from 'expo-router';
import Animated, { FadeIn, FadeOut, SlideInLeft, SlideOutRight } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderComponent from '../components/HeaderComponent';
import { LinearGradient } from 'expo-linear-gradient';

// Styled components
const GradientBackground = styled.View`
  flex: 1;
  background-color: #f8fffe;
  align-items: center;
  height: 100%;
`;
const Container = styled.View`
  /* flex: 1; */
  justify-content: flex-start;
  align-items: center;
  /* background-color: #f9f9fb; */
  padding: 20px;
`;
const DetailsContainer = styled.View`
  /* flex: 1; */
  justify-content: flex-start;
  /* align-items: center; */
  /* background-color: #f9f9fb; */
  /* padding: 20px; */
`;

const AvatarContainer = styled(Animated.View)`
  background-color: #ABE4FE;
  width: 120px;
  height: 120px;
  border-radius: 60px;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  shadow-color: #000;
  shadow-opacity: 0.3;
  shadow-radius: 10px;
  elevation: 8;
`;

const ProfileImage = styled.Image`
  width: 100px;
  height: 100px;
  border-radius: 50px;
`;

const UserName = styled(Animated.Text)`
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
`;

const InfoContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;
`;

const InfoIcon = styled(MaterialCommunityIcons)`
  margin-right: 10px;
`;

const InfoText = styled(Animated.Text)`
  font-size: 16px;
  color: #555;
`;

const IsManagerContainer = styled(Animated.View)`
  flex-direction: row;
  align-items: center;
  margin-bottom: 15px;
`;

const ManagerText = styled.Text`
  font-size: 16px;
  color: #333;
  margin-right: 10px;
`;

const LogOutButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 12px 20px;
  border-radius: 25px;
  background-color: #ffeded;
  margin-top: 30px;
  shadow-color: #000;
  shadow-opacity: 0.2;
  shadow-radius: 10px;
  elevation: 5;
`;

const LogOutText = styled.Text`
  color: #d9534f;
  font-size: 16px;
  margin-left: 10px;
`;

const ChangePasswordButton = styled.TouchableOpacity`
  background-color: #4d88ff;
  padding: 12px 25px;
  border-radius: 25px;
  margin-top: 20px;
  shadow-color: #000;
  shadow-opacity: 0.2;
  shadow-radius: 10px;
  elevation: 5;
`;

const ChangePasswordText = styled.Text`
  color: #fff;
  font-size: 16px;
`;

const ProfileScreen = () => {
  const { logout } = useContext(AppContext);
  const [profile, setProfile] = useState({});
  const [isManager, setIsManager] = useState(false);
  const [userPin, setUserPin] = useState(null);

    useEffect(() => {
        const fetchUserPin = async () => {
            const storedPin = await AsyncStorage.getItem('userPin');
            setUserPin(storedPin); // storedPin will be `null` if no value is found
        };
        fetchUserPin();
    }, []);
  const router = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
    getProfileInfo().then((res) => {
      setProfile(res.data);
      setIsManager(res.data.user_group.is_manager);
    });
  }, []);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handlePressPassword = () => {
    router.push({ pathname: 'ResetPassword' });
  };

  // console.log('Profile Data==',profile)

  return (
    <>
      <GradientBackground>
      <HeaderComponent headerTitle="My Profile" onBackPress={handleBackPress} />
      <Container>
        <AvatarContainer>
          <ProfileImage source={{ uri: profile?.image }} />
        </AvatarContainer>

        <UserName>{profile?.emp_data?.name}</UserName>
        <UserName>{profile?.user_name}</UserName>

        <IsManagerContainer>
          <ManagerText>Is Manager:</ManagerText>
          <MaterialCommunityIcons
            name={isManager ? "check-circle" : "cancel"}
            size={24}
            color={isManager ? "lightblue" : "red"}
          />
        </IsManagerContainer>

        <DetailsContainer>
        

        {profile?.emp_data?.emp_id && (
          <InfoContainer entering={SlideInLeft.delay(400)}>
            <InfoIcon name="badge-account-horizontal" size={24} color="#555" />
            <InfoText entering={FadeIn.duration(300)}>Employee ID: {profile.emp_data.emp_id}</InfoText>
          </InfoContainer>
        )}
        {profile?.emp_data?.department_name && (
          <InfoContainer entering={SlideInLeft.delay(500)}>
            <InfoIcon name="office-building" size={24} color="#555" />
            <InfoText entering={FadeIn.duration(400)}>Department: {profile.emp_data.department_name}</InfoText>
          </InfoContainer>
        )}
        {profile?.mobile_number && (
          <InfoContainer entering={SlideInLeft.delay(600)}>
            <InfoIcon name="phone" size={24} color="#555" />
            <InfoText entering={FadeIn.duration(500)}>Mobile: {profile.mobile_number}</InfoText>
          </InfoContainer>
        )}

        </DetailsContainer>

        <LogOutButton onPress={logout}>
          <MaterialCommunityIcons name="logout" size={24} color="#d9534f" />
          <LogOutText>Log Out</LogOutText>
        </LogOutButton>

        <ChangePasswordButton onPress={handlePressPassword}>
          <ChangePasswordText>{userPin?"Update Your Pin":"Set Your Pin"}</ChangePasswordText>
        </ChangePasswordButton>
      </Container>
      </GradientBackground>
    </>
  );
};

export default ProfileScreen;
