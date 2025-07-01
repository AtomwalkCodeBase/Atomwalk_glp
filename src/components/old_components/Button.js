import React from "react";
import { TouchableOpacity, Text, Image, StyleSheet } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from "../../Styles/appStyle";

export const CircleButton = ({ 
  imgUrl, 
  handlePress, 
  data, 
  icon, 
  text, 
  disabled = false,
  backgroundColor = colors.offwhite,
  textColor = colors.white,
  style,
  ...props 
}) => {
  const onPress = () => {
    if (!disabled) {
      handlePress(data);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.circleButton,
        {
          backgroundColor: disabled ? colors.lightGray : backgroundColor,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      {...props}
    >
      {icon && (
        <MaterialIcons
          name={icon}
          size={24}
          color={icon === 'delete' ? colors.red : textColor}
        />
      )}
      {!icon && imgUrl && (
        <Image
          source={imgUrl}
          resizeMode="contain"
          style={{ width: 24, height: 24, tintColor: textColor }}
        />
      )}
      {text && (
        <Text style={[styles.circleButtonText, { color: textColor }]}>
          {text}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export const RectButton = ({ 
  minWidth = 140, 
  fontSize = 16, 
  handlePress, 
  title = 'View Details',
  disabled = false,
  backgroundColor = colors.black,
  textColor = colors.white,
  style,
  ...props 
}) => {
  const onPress = () => {
    if (!disabled) {
      handlePress();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.rectButton,
        {
          backgroundColor: disabled ? colors.lightGray : backgroundColor,
          minWidth: minWidth,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      {...props}
    >
      <Text
        style={[
          styles.rectButtonText,
          {
            fontSize: fontSize,
            color: textColor,
          }
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  circleButton: {
    width: 70,
    height: 40,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  circleButtonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: '500',

  },
  rectButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  rectButtonText: {
    textAlign: "center",
    fontWeight: '500',
  },
});