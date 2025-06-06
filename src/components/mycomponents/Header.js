// components/mycomponents/Header.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from './Button'; 
import { useNavigation } from 'expo-router';

const Header = ({ title, subtitle, showBackButton }) => {

	const navigation = useNavigation();
const onBackPress = () => {
    navigation.goBack();
  };
  return (
    <View style={styles.header}>
      <View style={styles.headerBackContainer}>
        <Text style={styles.headerTitle}>{title}</Text>
        {showBackButton && (
          <Button
            title="⬅ Back"
            // variant="secondary"
            onPress={onBackPress}
            style={styles.backButton}
          />
        )}
      </View>
      <Text style={styles.headerSubtitle}>{subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#c2fbcd',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerBackContainer: {
    flexDirection: 'row',
	justifyContent: "space-between",
    alignItems: 'center',
    gap: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a2e1a',
    marginBottom: 4,
	marginTop:20,
	maxWidth: 200
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#2d5a3d',
    opacity: 0.8,
  },
  backButton: {
	marginTop:20,
    paddingHorizontal: 16,
    paddingVertical: 2,
  },
});

export default Header;