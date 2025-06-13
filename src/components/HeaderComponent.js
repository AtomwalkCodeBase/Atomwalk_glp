import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

// Styled Components
const HeaderContainer = styled(SafeAreaView)`
  background-color: #c2fbcd;
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

const PlaceholderView = styled(View)`
  width: 30px;
`;

// HeaderComponent
const HeaderComponent = ({ headerTitle, onBackPress }) => {
  return (
    <HeaderContainer edges={["top"]}>
      {/* Back Button */}
      <BackButton onPress={onBackPress}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </BackButton>

      {/* Title */}
      <HeaderTitle numberOfLines={1}>{headerTitle}</HeaderTitle>

      {/* Placeholder */}
      <PlaceholderView />
    </HeaderContainer>
  );
};

export default HeaderComponent;
