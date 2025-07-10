import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, ScrollView, Switch } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { AppContext } from '../../context/AppContext';
import { useNavigation, useRouter } from 'expo-router';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderComponent from '../components/HeaderComponent';
import Loader from '../components/old_components/Loader';
import ConfirmationModal from '../components/ConfirmationModal';
import Constants from 'expo-constants';


const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375; // iPhone SE and similar small devices
const isMediumScreen = width >= 375 && width < 414; // Most standard phones
const isLargeScreen = width >= 414; // Plus/Pro Max sizes

const ProfileScreen = () => {
  const { profile,isLoading,logout } = useContext(AppContext);
  const [userGroup, setUserGroup] = useState({});
  const [userPin, setUserPin] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [useFingerprint, setUseFingerprint] = useState(false);
  const [pendingValue, setPendingValue] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

    const appVersion = Constants.expoConfig?.version || '0.0.1';

  const router = useRouter();

  useEffect(() => {
    const fetchUserPin = async () => {
      const storedPin = await AsyncStorage.getItem('userPin');
      setUserPin(storedPin);
    };
    fetchUserPin();
    console.log('Profile Screen', profile);

  }, []);


  useEffect(() => {
    const fetchFingerprintPreference = async () => {
      const stored = await AsyncStorage.getItem('useFingerprint');
      if (stored !== null) {
        const value = stored === 'true';
        setUseFingerprint(value);
      }
    };
    fetchFingerprintPreference();
  }, []);

  const toggleFingerprint = async () => {
    const newValue = !useFingerprint;
    setUseFingerprint(newValue);
    await AsyncStorage.setItem('useFingerprint', newValue.toString());
  };

  const handleSwitchToggle = (newValue) => {
    setPendingValue(newValue);
    setModalVisible(true);
  };

  const handleConfirm = async () => {
    setUseFingerprint(pendingValue);
    await AsyncStorage.setItem('useFingerprint', pendingValue.toString());
    setModalVisible(false);
    setPendingValue(null);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setPendingValue(null);
  };

  const handleBackPress = () => router.back();
  const handlePressPassword = () => router.push({ pathname: 'ResetPassword' });
  const handleQRPress = () => setIsModalVisible(true);
  const handleCloseModal = () => setIsModalVisible(false);

  return (
    <>
      <HeaderComponent headerTitle="My Profile" onBackPress={handleBackPress} />
      {isLoading ? (
        <Loader visible={isLoading} />
      ) : (
        <ScrollView 
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Logout Button */}
          <TouchableOpacity 
            style={styles.qrButton} 
            onPress={() => setIsLogoutModalVisible(true)}
          >
            <MaterialCommunityIcons name="logout" size={isSmallScreen ? 24 : 28} color="#FF0031" />
          </TouchableOpacity>

          {/* Profile Header Section */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: profile?.emp_data?.image || profile?.image }} 
                style={styles.profileImage} 
                resizeMode="cover"
              />
            </View>
            
            <View style={styles.profileInfo}>
              <Text 
                style={styles.userName}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {profile?.emp_data?.name || 'Employee'}
              </Text>
              <Text 
                style={styles.userNameSmall}
                numberOfLines={2}
              >
                {profile?.user_name}
              </Text>
              
              <View style={styles.roleContainer}>
                <Text 
                  style={styles.userRole}
                  numberOfLines={1}
                >
                  {userGroup?.name || 'Employee Group'}
                </Text>
              </View>
              
              <View style={styles.userMeta}>
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons 
                    name="identifier" 
                    size={isSmallScreen ? 14 : 16} 
                    color="#7f8c8d" 
                  />
                  <Text 
                    style={styles.metaText}
                    numberOfLines={1}
                  >
                    {profile?.emp_data?.emp_id}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons 
                    name="office-building" 
                    size={isSmallScreen ? 14 : 16} 
                    color="#7f8c8d" 
                  />
                  <Text 
                    style={styles.metaText}
                    numberOfLines={1}
                  >
                    {profile?.emp_data?.department_name}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Personal Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            {profile?.emp_data?.email_id && (<InfoRow 
              icon="email" 
              label="Email" 
              value={profile?.emp_data?.email_id || 'Not available'} 
            />)}
            
            {(profile?.mobile_number || profile?.emp_data?.mobile_number) && (
            <InfoRow 
              icon="phone" 
              label="Mobile" 
              value={profile?.mobile_number || profile?.emp_data?.mobile_number || 'Not available'} 
            />
            )}
            
            {profile?.emp_data?.dob && (<InfoRow 
              icon="cake" 
              label="Date of Birth" 
              value={profile?.emp_data?.dob || 'Not available'} 
            />)}
            
            {profile?.emp_data?.date_of_join && (
            <InfoRow 
              icon="calendar" 
              label="Date of Joining" 
              value={profile?.emp_data?.date_of_join || 'Not available'} 
            />)}
          </View>

          {/* Security Section */}
          {userPin && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Security Settings</Text>
            
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <MaterialCommunityIcons 
                  name="fingerprint" 
                  size={isSmallScreen ? 18 : 20} 
                  color="#555" 
                />
                <Text style={styles.switchText}>Use Fingerprint for Login</Text>
              </View>
              <Switch
                value={useFingerprint}
                onValueChange={handleSwitchToggle}
                trackColor={{ false: "#dcdcdc", true: "#2A73FC" }}
                thumbColor={useFingerprint ? "#fff" : "#f4f3f4"}
              />
            </View>
          </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryButton]}
              onPress={handlePressPassword}
            >
              <MaterialCommunityIcons 
                name="lock" 
                size={isSmallScreen ? 18 : 20} 
                color="#fff" 
              />
              <Text style={styles.actionButtonText}>
                {userPin ? 'Update Your Pin' : 'Set Your Pin'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={() => setIsLogoutModalVisible(true)}
            >
              <MaterialCommunityIcons 
                name="logout" 
                size={isSmallScreen ? 18 : 20} 
                color="#d9534f" 
              />
              <Text style={[styles.actionButtonText, { color: '#d9534f' }]}>
                Log Out
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.versionContainer}>
          <Text style={styles.versionText}>
            App Version: {appVersion}
          </Text>
        </View>
          
          <ConfirmationModal
            visible={isLogoutModalVisible}
            message="Are you sure you want to logout?"
            onConfirm={() => {
              setIsLogoutModalVisible(false);
              logout();
            }}
            onCancel={() => setIsLogoutModalVisible(false)}
            confirmText="Logout"
            cancelText="Cancel"
          />

          <ConfirmationModal
            visible={modalVisible}
            message="Are you sure you want to change this setting?"
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        </ScrollView>
      )}
    </>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <MaterialCommunityIcons 
      name={icon} 
      size={isSmallScreen ? 18 : 20} 
      color="#555" 
      style={styles.infoIcon} 
    />
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text 
        style={styles.infoValue}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {value}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f7fa',
    paddingBottom: isSmallScreen ? 20 : 30,
  },
  qrButton: {
    position: 'absolute',
    top: isSmallScreen ? 12 : 15,
    right: isSmallScreen ? 15 : 20,
    backgroundColor: '#FBE6EA',
    padding: isSmallScreen ? 8 : 10,
    borderRadius: 25,
    elevation: 3,
    zIndex: 10,
},
  profileHeader: {
    backgroundColor: '#fff',
    padding: isSmallScreen ? 15 : 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatarContainer: {
    width: isSmallScreen ? 70 : 80,
    height: isSmallScreen ? 70 : 80,
    borderRadius: isSmallScreen ? 35 : 40,
    backgroundColor: '#e8f0fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isSmallScreen ? 15 : 20,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileInfo: {
    flex: 1,
    marginRight: isSmallScreen ? 40 : 50, // Add margin to prevent overlap with logout button
  },
  userName: {
    fontSize: isSmallScreen ? 18 : 20,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
    maxWidth: '90%', // Limit width to prevent overlap
},
  userNameSmall: {
    fontSize: isSmallScreen ? 12 : 14,
    color: '#7f8c8d',
    marginBottom: 6,
    maxWidth: '90%',
  },
  roleContainer: {
    alignSelf: 'flex-start',
    marginBottom: 1,
  },
  userRole: {
    fontSize: isSmallScreen ? 12 : 14,
    color: '#2A73FC',
    fontWeight: '500',
    marginBottom: 8,
    backgroundColor: '#e8f0fe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    maxWidth: '90%',
  },
  userMeta: {
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    fontSize: isSmallScreen ? 12 : 13,
    color: '#7f8c8d',
    marginLeft: 6,
    maxWidth: '80%',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: isSmallScreen ? 12 : 16,
    marginHorizontal: isSmallScreen ? 12 : 16,
    borderRadius: 12,
    padding: isSmallScreen ? 12 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: isSmallScreen ? 15 : 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: isSmallScreen ? 12 : 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isSmallScreen ? 12 : 16,
  },
  infoIcon: {
    marginRight: isSmallScreen ? 10 : 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: isSmallScreen ? 12 : 13,
    color: '#95a5a6',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: isSmallScreen ? 14 : 15,
    color: '#34495e',
    fontWeight: '500',
    maxWidth: '90%',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: isSmallScreen ? 6 : 8,
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  switchText: {
    fontSize: isSmallScreen ? 14 : 15,
    color: '#34495e',
    marginLeft: isSmallScreen ? 8 : 12,
    flexShrink: 1,
  },
  actionsContainer: {
    marginTop: isSmallScreen ? 20 : 24,
    paddingHorizontal: isSmallScreen ? 12 : 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isSmallScreen ? 12 : 14,
    borderRadius: 8,
    marginBottom: isSmallScreen ? 10 : 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  actionButtonText: {
    fontSize: isSmallScreen ? 15 : 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  versionContainer: {
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  versionText: {
    fontSize: 12,
    color: '#95a5a6',
  },
});

export default ProfileScreen;