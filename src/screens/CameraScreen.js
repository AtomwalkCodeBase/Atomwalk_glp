import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/mycomponents/Button';
import { useNavigation, useRouter } from 'expo-router';
// import { Button } from '../components/Button';


const CameraScreen = () => {

  const navigation = useNavigation();
  const router = useRouter();
  
  const onCancel = () => {
    navigation.goBack();
  };
  const onStartScan = () => {
    console.log("button")
    router.push({
      pathname: "AnalysisScreen",
    });
  };

  return(
  <SafeAreaView style={styles.container}>
    <StatusBar barStyle="light-content" backgroundColor="#1f2937" />
    
    <View style={styles.cameraContainer}>
      <View style={styles.cameraView}>
        <View style={styles.cameraIcon}>
          <Ionicons name="camera-outline" size={80} color="#c2fbcd" />
        </View>
        <Text style={styles.cameraText}>Position yourself in the camera</Text>
        <Text style={styles.cameraSubtext}>
          Make sure your face and safety equipment are clearly visible
        </Text>
        
        <View style={styles.instructionsContainer}>
          <View style={styles.instruction}>
            <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
            <Text style={styles.instructionText}>Wear safety goggles</Text>
          </View>
          <View style={styles.instruction}>
            <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
            <Text style={styles.instructionText}>Put on lab coat</Text>
          </View>
          <View style={styles.instruction}>
            <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
            <Text style={styles.instructionText}>Wear protective gloves</Text>
          </View>
        </View>
      </View>

      <View style={styles.cameraControls}>
        <Button 
          title="❌ Cancel" 
          variant="secondary" 
          onPress={onCancel}
          style={styles.cancelButton}
        />
        <Button 
          title="📷 Start Scan" 
          onPress={onStartScan}
          style={styles.scanButton}
        />
      </View>
    </View>
  </SafeAreaView>
);
}

export default CameraScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#1f2937',
  },
  cameraView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  cameraIcon: {
    backgroundColor: 'rgba(194, 251, 205, 0.1)',
    padding: 40,
    borderRadius: 50,
    marginBottom: 32,
  },
  cameraText: {
    color: '#c2fbcd',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  cameraSubtext: {
    color: '#94a3b8',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  instructionsContainer: {
    alignItems: 'flex-start',
  },
  instruction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  instructionText: {
    color: '#e5e7eb',
    fontSize: 16,
    fontWeight: '500',
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 40,
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#6b7280',
  },
  scanButton: {
    // flex: 1,
  },
});
