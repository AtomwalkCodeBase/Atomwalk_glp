import { View, Text, StyleSheet, StatusBar, ActivityIndicator, ScrollView, Dimensions, Platform } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Badge } from "../components/mycomponents/Badge";
import { getUserBooking } from "../services/productServices";
import { Card } from "../components/mycomponents/Card";
import { useRouter } from "expo-router";
import Header from "../components/mycomponents/Header";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive breakpoints
const BREAKPOINTS = {
  small: 350,
  medium: 768,
  large: 1024,
};

const getScreenType = (width) => {
  if (width < BREAKPOINTS.small) return 'xs';
  if (width < BREAKPOINTS.medium) return 'sm';
  if (width < BREAKPOINTS.large) return 'md';
  return 'lg';
};

const LabBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLab, setSelectedLab] = useState(null);
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const router = useRouter();

  const screenType = getScreenType(dimensions.width);
  const isTablet = screenType === 'md' || screenType === 'lg';

  // Listen for dimension changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  // Fetch and process bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        const res = await getUserBooking();
        const apiData = res.data || [];

        // Group activities by lab_name and activity_name
        const groupedBookings = apiData.reduce((acc, item) => {
          const labName = item.lab_name || "Unassigned Lab";
          const existingLab = acc.find((lab) => lab.labName === labName);

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
            const existingActivity = existingLab.activities.find(
              (act) => act.name === item.activity_name
            );
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
        console.error("Error fetching bookings:", error);
        setBookings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#c2fbcd" />
        <View style={[styles.loadingContainer, { minHeight: dimensions.height * 0.8 }]}>
          <ActivityIndicator size="large" color="#4a9960" />
          <Text style={[styles.loadingText, { fontSize: screenType === 'xs' ? 14 : 16 }]}>
            Loading Bookings...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleLabSelect = (lab) => {
    setSelectedLab(lab);
    router.push({
      pathname: "LabActivity",
      params: { lab: JSON.stringify(lab) },
    });
  };

  const getCardStyle = () => {
    const baseStyle = styles.labCard;
    if (isTablet) {
      return [baseStyle, styles.tabletCard];
    }
    return baseStyle;
  };

  const getContentPadding = () => {
    switch (screenType) {
      case 'xs':
        return 12;
      case 'sm':
        return 16;
      case 'md':
        return 24;
      case 'lg':
        return 32;
      default:
        return 16;
    }
  };

  const getGridColumns = () => {
    if (isTablet && bookings.length > 1) {
      return 2;
    }
    return 1;
  };

  const renderBookings = () => {
    const columns = getGridColumns();
    
    if (columns === 1) {
      // Single column layout for mobile
      return bookings.map((booking) => (
        <Card
          key={booking.id}
          style={getCardStyle()}
          onPress={() => handleLabSelect(booking)}
        >
          <View style={styles.labHeader}>
            <View style={styles.labTitleContainer}>
              <Ionicons 
                name="beaker-outline" 
                size={screenType === 'xs' ? 20 : 24} 
                color="#2d5a3d" 
              />
              <Text style={[
                styles.labTitle,
                { fontSize: screenType === 'xs' ? 16 : 20 }
              ]}>
                {booking.labName}
              </Text>
            </View>
            <Badge
              text={`${booking.activities.length} ${booking.activities.length === 1 ? 'activity' : 'activities'}`}
              icon={Ionicons}
              iconName="flask-outline"
            />
          </View>
          
          {/* Preview of activities for better UX */}
          <View style={styles.activityPreview}>
            <Text style={[
              styles.previewText,
              { fontSize: screenType === 'xs' ? 12 : 14 }
            ]}>
              {booking.activities.slice(0, 2).map(activity => activity.name).join(', ')}
              {booking.activities.length > 2 && ` +${booking.activities.length - 2} more`}
            </Text>
          </View>
        </Card>
      ));
    } else {
      // Grid layout for tablets
      const rows = [];
      for (let i = 0; i < bookings.length; i += columns) {
        const rowItems = bookings.slice(i, i + columns);
        rows.push(
          <View key={i} style={styles.gridRow}>
            {rowItems.map((booking) => (
              <View key={booking.id} style={styles.gridItem}>
                <Card
                  style={getCardStyle()}
                  onPress={() => handleLabSelect(booking)}
                >
                  <View style={styles.labHeader}>
                    <View style={styles.labTitleContainer}>
                      <Ionicons name="beaker-outline" size={24} color="#2d5a3d" />
                      <Text style={[styles.labTitle, { fontSize: 18 }]} numberOfLines={1}>
                        {booking.labName}
                      </Text>
                    </View>
                    <Badge
                      text={`${booking.activities.length}`}
                      icon={Ionicons}
                      iconName="flask-outline"
                    />
                  </View>
                  <View style={styles.activityPreview}>
                    <Text style={styles.previewText} numberOfLines={2}>
                      {booking.activities.slice(0, 2).map(activity => activity.name).join(', ')}
                      {booking.activities.length > 2 && ` +${booking.activities.length - 2} more`}
                    </Text>
                  </View>
                </Card>
              </View>
            ))}
            {/* Fill empty space in last row */}
            {rowItems.length < columns && (
              <View style={[styles.gridItem, { opacity: 0 }]} />
            )}
          </View>
        );
      }
      return rows;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#c2fbcd" />
      <Header 
        title="My Lab Bookings" 
        subtitle="Today's Schedule" 
        showBackButton={false} 
      />

      <ScrollView 
        style={[styles.content, { paddingHorizontal: getContentPadding() }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {bookings.length > 0 ? (
          <View style={styles.bookingsContainer}>
            {renderBookings()}
          </View>
        ) : (
          <View style={[
            styles.noBookingsContainer,
            { minHeight: dimensions.height * 0.6 }
          ]}>
            <Ionicons name="alert-circle-outline" size={60} color="#6b7280" />
            <Text style={[
              styles.noBookingsText,
              { fontSize: screenType === 'xs' ? 14 : 16 }
            ]}>
              No Bookings Available
            </Text>
            <Text style={[
              styles.noBookingsSubtext,
              { fontSize: screenType === 'xs' ? 12 : 14 }
            ]}>
              Your lab bookings will appear here once you make a reservation
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default LabBooking;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    color: "#2d5a3d",
    fontWeight: "500",
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  bookingsContainer: {
    flex: 1,
  },
  labCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#4a9960",
    minHeight: 100,
  },
  tabletCard: {
    marginBottom: 12,
    marginHorizontal: 6,
  },
  labHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    flexWrap: "wrap",
    gap: 8,
  },
  labTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    minWidth: 0, // Allows text to truncate
  },
  labTitle: {
    fontWeight: "bold",
    color: "#1f2937",
    flex: 1,
  },
  activityPreview: {
    backgroundColor: "#f0fdf4",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  previewText: {
    color: "#15803d",
    fontWeight: "500",
    lineHeight: 18,
  },
  gridRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  gridItem: {
    flex: 1,
  },
  noBookingsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 32,
  },
  noBookingsText: {
    color: "#374151",
    fontWeight: "600",
    textAlign: "center",
  },
  noBookingsSubtext: {
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 280,
  },
});