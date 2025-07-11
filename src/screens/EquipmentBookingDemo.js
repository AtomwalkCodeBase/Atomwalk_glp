import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import HeaderComponent from '../components/HeaderComponent';

const EquipmentBooking = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <HeaderComponent headerTitle="Equipment Booking" onBackPress={() => router.back()} />
      <View style={styles.content}>
        <Text style={styles.title}>Equipment Booking</Text>
        <Text style={styles.message}>Coming Soon.....</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fffe',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    color: '#64748b',
  },
});

export default EquipmentBooking;