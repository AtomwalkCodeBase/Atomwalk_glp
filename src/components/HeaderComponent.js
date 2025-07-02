import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

// Styled Components
const StatusBarView = styled(View)`
  background-color: #5ed2ce;
`;

const HeaderContainer = styled(SafeAreaView)`
  background-color: #5ed2ce;
  padding: 10px 20px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border-bottom-width: 1px;
  border-bottom-color: #e0e0e0;
`;

const BackButton = styled(TouchableOpacity)`
  width: 30px;
  align-items: flex-start;
`;

const HeaderTitle = styled(Text)`
  font-size: 20px;
  font-weight: bold;
  color: #000;
  text-align: center;
  flex: 1;
`;

const RightIconsContainer = styled(View)`
  flex-direction: row;
  align-items: center;
`;

const IconButton = styled(TouchableOpacity)`
  width: 30px;
  align-items: center;
`;

const Spacer = styled(View)`
  width: 30px;
`;

// HeaderComponent
const HeaderComponent = ({
  headerTitle,
  onBackPress,
  icon1Name,
  icon1OnPress,
  icon2Name,
  icon2OnPress,
}) => {
  return (
    <>
      {/* Handle status bar for Android */}
      {Platform.OS === 'android' && <StatusBarView />}
      
      {/* SafeAreaView for iOS notches and header content */}
      <HeaderContainer edges={['top']}>
        {/* Back Button */}
        <BackButton onPress={onBackPress} activeOpacity={0.6}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </BackButton>

        {/* Title */}
        <HeaderTitle numberOfLines={1}>{headerTitle}</HeaderTitle>

        {/* Right Icons or Spacer */}
        <RightIconsContainer>
          {icon1Name && (
            <IconButton onPress={icon1OnPress} activeOpacity={0.6}>
              <Ionicons name={icon1Name} size={24} color="#000" />
            </IconButton>
          )}
          {icon2Name && (
            <IconButton onPress={icon2OnPress} activeOpacity={0.6}>
              <Ionicons name={icon2Name} size={24} color="#000" />
            </IconButton>
          )}
          {!icon1Name && !icon2Name && <Spacer />}
        </RightIconsContainer>
      </HeaderContainer>
    </>
  );
};

export default HeaderComponent;