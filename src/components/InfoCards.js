import React from 'react';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Choose your preferred icon set

// InfoCard container with shadow and gradient background
const InfoCardContainer = styled(LinearGradient).attrs((props) => ({
  colors: props.colors || ['#ffffff', '#ffffff'],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
}))`
  width: 130px;
  height: 130px;
  margin: 8px;
  border-radius: 12px;
  justify-content: center;
  align-items: center;
  elevation: 4; /* Shadow for Android */
  shadow-color: #000; /* Shadow for iOS */
  shadow-offset: 0px 2px;
  shadow-opacity: 0.2;
  shadow-radius: 4px;
`;

// Text Components
const NumberText = styled.Text`
  font-size: 28px;
  font-weight: bold;
  color: #ffffff;
`;

const LabelText = styled.Text`
  font-size: 15px;
  color: #ffffff;
  margin-top: 4px;
  font-weight: 600;
  flex-wrap: wrap;
`;

// Icon Container
const IconContainer = styled.View`
  margin-bottom: 8px;
`;

// InfoCard Component
const InfoCards = ({ number, label, gradientColors, iconName, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
    <InfoCardContainer colors={gradientColors}>
      <IconContainer>
        <Icon name={iconName} size={36} color="#ffffff" />
      </IconContainer>
      <NumberText>{number}</NumberText>
      <LabelText>{label}</LabelText>
    </InfoCardContainer>
  </TouchableOpacity>
);

export default InfoCards;