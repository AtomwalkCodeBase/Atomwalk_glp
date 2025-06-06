import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export const Button = ({ title, onPress, variant = 'primary', style, disabled }) => (
  <TouchableOpacity 
    style={[
      styles.button, 
      variant === 'secondary' && styles.buttonSecondary,
      disabled && styles.buttonDisabled,
      style
    ]} 
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.8}
  >
    {/* <MaterialIcons name="arrow-back" size={24} color="#4a9960" /> */}
    <Text style={[
      styles.buttonText, 
      variant === 'secondary' && styles.buttonTextSecondary
    ]}>
      {title}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4a9960',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    minHeight: 40,
    justifyContent: 'center',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#4a9960',
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  buttonTextSecondary: {
    color: '#4a9960',
  },
});
