import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import { AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import LoadingStep from '../components/mycomponents/LoadingStep';
import { Button } from '../components/mycomponents/Button';

// Define analysisSteps here or import from a shared file
const analysisSteps = [
  { id: 1, text: "Detecting Mask", icon: MaterialCommunityIcons, key: "face", iconName: "face-mask-outline" },
  { id: 2, text: "Scanning gloves", icon: Ionicons, key: "gloves", iconName: "hand-left-outline" },
  { id: 3, text: "Checking safety goggles", icon: Ionicons, key: "goggles", iconName: "glasses-outline" },
  { id: 4, text: "Verifying lab coat", icon: Ionicons, key: "coat", iconName: "shirt-outline" }
];

export const AnalysisScreen = ({ onComplete }) => {
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [activeStep, setActiveStep] = useState(-1);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // Analysis step progression
  useEffect(() => {
    setActiveStep(0);
    const timer = setInterval(() => {
      setActiveStep(prev => {
        if (prev < analysisSteps.length - 1) {
          setCompletedSteps(prevSet => new Set([...prevSet, analysisSteps[prev].key]));
          return prev + 1;
        } else if (prev === analysisSteps.length - 1) {
          setCompletedSteps(prevSet => new Set([...prevSet, analysisSteps[prev].key]));
          setTimeout(() => setAnalysisComplete(true), 1000);
          return prev + 1;
        }
        return prev;
      });
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#c2fbcd" />
      <View style={styles.analysisContainer}>
        <View style={styles.analysisHeader}>
          <Text style={styles.analysisTitle}>Safety Check in Progress</Text>
          <Text style={styles.analysisSubtitle}>
            Analyzing your safety equipment for lab entry...
          </Text>
        </View>

        <View style={styles.stepsContainer}>
          {analysisSteps.map((step, index) => (
            <LoadingStep
              key={step.id}
              step={step}
              isCompleted={completedSteps.has(step.key)}
              isActive={index === activeStep}
            />
          ))}
        </View>

        {analysisComplete && (
          <View style={styles.successContainer}>
            <AntDesign name="checkcircleo" size={60} color="#2d5a3d" />
            <Text style={styles.successTitle}>Safety Check Complete!</Text>
            <Text style={styles.successSubtitle}>
              All safety equipment verified. You may now enter the lab safely.
            </Text>
            <Button
              title="🚪 Continue to Lab"
              onPress={onComplete}
              style={styles.continueButton}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  analysisContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  analysisHeader: {
    alignItems: 'center',
    marginTop:20,
    marginBottom: 40,
  },
  analysisTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  analysisSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  stepsContainer: {
    flex: 1,
    paddingVertical: 20,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2d5a3d',
    marginBottom: 12,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  continueButton: {
    paddingHorizontal: 48,
    minWidth: 200,
  },
});