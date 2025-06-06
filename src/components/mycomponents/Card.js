import { TouchableOpacity, StyleSheet } from 'react-native';

export const Card = ({ children, style, onPress }) => (
  <TouchableOpacity 
    style={[styles.card, style]} 
    onPress={onPress}
    activeOpacity={onPress ? 0.7 : 1}
  >
    {children}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
});