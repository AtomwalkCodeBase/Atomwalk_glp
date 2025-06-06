import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { Ionicons, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { get_user_booking_list, getUserBooking } from '../services/productServices';

// Analysis steps for the safety check
const analysisSteps = [
  { id: 1, text: "Detecting Mask", icon: MaterialCommunityIcons, key: "face", iconName: "face-mask-outline" },
  { id: 2, text: "Scanning gloves", icon: Ionicons, key: "gloves", iconName: "hand-left-outline" },
  { id: 3, text: "Checking safety goggles", icon: Ionicons, key: "goggles", iconName: "glasses-outline" },
  { id: 4, text: "Verifying lab coat", icon: Ionicons, key: "coat", iconName: "shirt-outline" }
];

// Reusable Components
const Card = ({ children, style, onPress }) => (
  <TouchableOpacity 
    style={[styles.card, style]} 
    onPress={onPress}
    activeOpacity={onPress ? 0.7 : 1}
  >
    {children}
  </TouchableOpacity>
);

const Button = ({ title, onPress, variant = 'primary', style, disabled }) => (
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
    <Text style={[
      styles.buttonText, 
      variant === 'secondary' && styles.buttonTextSecondary
    ]}>
      {title}
    </Text>
  </TouchableOpacity>
);

const Badge = ({ text, icon: Icon, iconName }) => (
  <View style={styles.badge}>
    {Icon && iconName && <Icon name={iconName} size={14} color="#2d5a3d" />}
    <Text style={styles.badgeText}>{text}</Text>
  </View>
);

const LoadingStep = ({ step, isCompleted, isActive }) => {
  const Icon = step.icon;
  return (
    <View style={[
      styles.stepContainer,
      isActive && styles.stepContainerActive
    ]}>
      <View style={styles.stepIcon}>
        {isActive && !isCompleted ? (
          <ActivityIndicator size="small" color="#4a9960" style={styles.loader} />
        ) : isCompleted ? (
          <AntDesign name="checkcircleo" size={24} color="#2d5a3d" />
        ) : (
          <Icon name={step.iconName} size={24} color="#94a3b8" />
        )}
      </View>
      <Text style={[
        styles.stepText,
        isCompleted && styles.stepTextCompleted,
        isActive && styles.stepTextActive
      ]}>
        {step.text}
      </Text>
    </View>
  );
};

export default function LabBookingApp() {
  const [currentScreen, setCurrentScreen] = useState('bookings');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedLab, setSelectedLab] = useState(null);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [activeStep, setActiveStep] = useState(-1);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch and process bookings
useEffect(() => {
  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const res = await getUserBooking();
      const apiData = res.data || [];

      // Group activities by lab_name and activity_name
      const groupedBookings = apiData.reduce((acc, item) => {
        const labName = item.lab_name || 'Unassigned Lab';
        const existingLab = acc.find(lab => lab.labName === labName);

        const activity = {
          id: item.id,
          name: item.activity_name,
          equipment: [item.eq_name],
          time: `${item.start_time} - ${item.end_time}`,
          status: item.status_display,
          projectTitle: item.project_title,
          bookingDate: item.booking_date,
        };

        if (existingLab) {
          const existingActivity = existingLab.activities.find(act => act.name === item.activity_name);
          if (existingActivity) {
            existingActivity.equipment.push(item.eq_name);
          } else {
            existingLab.activities.push(activity);
          }
        } else {
          acc.push({
            id: item.id,
            labName,
            activities: [activity],
          });
        }
        return acc;
      }, []);

      setBookings(groupedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  fetchBookings();
}, []);

  // Analysis step progression
  useEffect(() => {
    if (currentScreen === 'analysis') {
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
    }
  }, [currentScreen]);

  const handleEnterLab = (activity) => {
    setSelectedActivity(activity);
    setCurrentScreen('camera');
  };

  const handleLabSelect = (lab) => {
    setSelectedLab(lab);
    setCurrentScreen('activities');
  };

  const startAnalysis = () => {
    setCurrentScreen('analysis');
    setCompletedSteps(new Set());
    setActiveStep(-1);
    setAnalysisComplete(false);
  };

  const resetToBookings = () => {
    setCurrentScreen('bookings');
    setSelectedActivity(null);
    setSelectedLab(null);
    setCompletedSteps(new Set());
    setActiveStep(-1);
    setAnalysisComplete(false);
  };

  const backToLabs = () => {
    setCurrentScreen('bookings');
    setSelectedLab(null);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#c2fbcd" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a9960" />
          <Text style={styles.loadingText}>Loading Bookings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (currentScreen === 'bookings') {
    return (
      <SafeAreaView style={styles.container} edges={['right', 'bottom', 'left']}>
        <StatusBar barStyle="dark-content" backgroundColor="#c2fbcd" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Lab Bookings</Text>
          <Text style={styles.headerSubtitle}>Today's Schedule</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <Card 
                key={booking.id} 
                style={styles.labCard}
                onPress={() => handleLabSelect(booking)}
              >
                <View style={styles.labHeader}>
                  <View style={styles.labTitleContainer}>
                    <Ionicons name="beaker-outline" size={24} color="#2d5a3d" />
                    <Text style={styles.labTitle}>{booking.labName}</Text>
                  </View>
                  <Badge 
                    text={`${booking.activities.length} activities`} 
                    icon={Ionicons} 
                    iconName="flask-outline"
                  />
                </View>
              </Card>
            ))
          ) : (
            <View style={styles.noBookingsContainer}>
              <Ionicons name="alert-circle-outline" size={60} color="#6b7280" />
              <Text style={styles.noBookingsText}>No Bookings Available</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (currentScreen === 'activities') {
    return (
      <SafeAreaView style={styles.container} edges={['right', 'bottom', 'left']}>
        <StatusBar barStyle="dark-content" backgroundColor="#c2fbcd" />
        <View style={styles.header}>
          <View style={styles.headerBackContainer}>
            <Button
              title="⬅ Back"
              variant="secondary"
              onPress={backToLabs}
              style={styles.backButton}
            />
            <Text style={styles.headerTitle}>{selectedLab.labName}</Text>
          </View>
          <Text style={styles.headerSubtitle}>Activities and Equipment</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.activitiesContainer}>
            {selectedLab.activities.map((activity) => (
              <Card key={activity.id} style={styles.activityCard}>
                <View style={styles.activityHeader}>
                  <Text style={styles.activityName}>{activity.name}</Text>
                </View>
                <View style={styles.timeContainer}>
                  <AntDesign name="clockcircleo" size={14} color="#6b7280" />
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
                <Text style={styles.equipmentLabel}>Equipment:</Text>
                <View style={styles.equipmentContainer}>
                  {activity.equipment.map((item, index) => (
                    <Badge 
                      key={index} 
                      text={item} 
                      icon={Ionicons} 
                      iconName="construct-outline"
                    />
                  ))}
                </View>
                <Text style={styles.projectLabel}>Project:</Text>
                <Text style={styles.projectText}>{activity.projectTitle}</Text>
                <Text style={styles.statusLabel}>Status: <Text style={styles.statusText}>{activity.status}</Text></Text>
                <Text style={styles.dateLabel}>Booking Date: <Text style={styles.dateText}>{activity.bookingDate}</Text></Text>
                <Button 
                  title="🚪 Enter Lab" 
                  onPress={() => handleEnterLab(activity)}
                  style={styles.enterButton}
                  disabled={activity.status === 'COMPLETED'}
                />
              </Card>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (currentScreen === 'camera') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1f2937" />
        <View style={styles.cameraContainer}>
          <View style={styles.cameraView}>
            <View style={styles.cameraIcon}>
              <Ionicons name="camera-outline" size={80} color="#c2fbcd" />
            </View>
            <Text style={styles.cameraText}>Position yourself in the camera</Text>
            <Text style={styles.cameraSubtext}>Make sure your face and safety equipment are visible</Text>
          
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
              onPress={resetToBookings}
              style={styles.cancelButton}
            />
            <Button 
              title="📷 Start Scan" 
              onPress={startAnalysis}
              style={styles.scanButton}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (currentScreen === 'analysis') {
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
                onPress={resetToBookings}
                style={styles.continueButton}
              />
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#c2fbcd',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerBackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a2e1a',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#2d5a3d',
    opacity: 0.8,
  },
  content: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  labCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4a9960',
  },
  labHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  labTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  labTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    fontSize: 13,
    color: '#2d5a3d',
    fontWeight: '500',
  },
  activitiesContainer: {
    gap: 12,
  },
  activityCard: {
    backgroundColor: '#f8faff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  activityTime: {
    fontSize: 14,
    color: '#6b7280',
  },
  equipmentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  equipmentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  projectLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  projectText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  statusText: {
    fontWeight: '400',
    color: '#2d5a3d',
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  dateText: {
    fontWeight: '400',
    color: '#6b7280',
  },
  button: {
    backgroundColor: '#4a9960',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
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
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: '#4a9960',
  },
  enterButton: {
    marginTop: 8,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
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
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 24,
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
    flex: 1,
  },
  analysisContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  analysisHeader: {
    alignItems: 'center',
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
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stepContainerActive: {
    backgroundColor: '#e8f5e8',
    borderWidth: 1,
    borderColor: '#4a9960',
  },
  stepIcon: {
    marginRight: 16,
    width: 24,
    alignItems: 'center',
  },
  loader: {
    marginRight: 16,
  },
  stepText: {
    fontSize: 16,
    color: '#6b7280',
    flex: 1,
  },
  stepTextCompleted: {
    color: '#2d5a3d',
    fontWeight: '600',
  },
  stepTextActive: {
    color: '#4a9960',
    fontWeight: '700',
    fontSize: 17,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d5a3d',
    marginTop: 16,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  continueButton: {
    paddingHorizontal: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#6b7280',
    marginTop: 16,
  },
  noBookingsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noBookingsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
});