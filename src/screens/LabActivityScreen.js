import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from "react-native";
import React, { useState } from "react";
import { Button } from "../components/mycomponents/Button";
import { Badge } from "../components/mycomponents/Badge";
import { Card } from "../components/mycomponents/Card"; // Import Card
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign"; // Import AntDesign
import Header from "../components/mycomponents/Header";

const LabActivityScreen = () => {
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const lab = params.lab ? JSON.parse(params.lab) : null;

  // Handle loading state
  if (isLoading || !lab) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#c2fbcd" />
        <View style={(styles.loadingContainer)}>
          <ActivityIndicator size="large" color="#4a9960" />
          <Text style={styles.loadingText}>
            {lab ? "Loading Bookings..." : "No Lab Data Available"}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const backToLabs = () => {
    navigation.goBack();
  };

  // Handle entering a lab (placeholder for actual implementation)
  const handleEnterLab = (activity) => {
	 router.push({
      pathname: "CameraScreen",
    });
    // console.log("Entering lab for activity:", activity);
    // Add logic to handle entering the lab, e.g., navigate to another screen or perform an action
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#c2fbcd" />
      {/* <View style={styles.header}>
        <View style={styles.headerBackContainer}>
          <Text style={styles.headerTitle}>{lab.labName}</Text>

          <Button
            title="⬅ Back"
            variant="secondary"
            onPress={backToLabs}
            style={styles.backButton}
          />
        </View>
        <Text style={styles.headerSubtitle}>Activities and Equipment</Text>
      </View> */}
     <Header title={lab.labName} subtitle="Activities and Equipment" showBackButton={true} />


      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.activitiesContainer}>
          {lab.activities.map((activity) => (
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
              <Text style={styles.statusLabel}>
                Status: <Text style={styles.statusText}>{activity.status}</Text>
              </Text>
              <Text style={styles.dateLabel}>
                Booking Date:{" "}
                <Text style={styles.dateText}>{activity.bookingDate}</Text>
              </Text>
              <Button
                title="🚪 Enter Lab"
                onPress={() => handleEnterLab(activity)}
                style={styles.enterButton}
                disabled={activity.status === "COMPLETED"}
              />
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LabActivityScreen;

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
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  enterButton: {
    marginTop: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#4b5563",
  },
});