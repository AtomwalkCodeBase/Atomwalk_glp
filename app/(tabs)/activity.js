import { StyleSheet, View } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import ActivityScreen from '../../src/screens/AllActivity';
import { getProfileInfo } from '../../src/services/authServices';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';

const Activity = () => {
  const params = useLocalSearchParams(); // Get search params from URL
  const [callType, setCallType] = useState(params.call_type || 'PROJECT'); // Default to 'PROJECT'

  useFocusEffect(
    React.useCallback(() => {
      setCallType(params.call_type || 'PROJECT'); // Refresh callType each time page is entered
    }, [params.call_type])
  );
  useEffect(() => {
    getProfileInfo()
      .then((res) => {
        setProfile(res.data);
        setIsManager(res?.data?.user_group?.is_manager || false);
        setUser(res?.data?.user_name);
      })
      .catch(() => {
        setIsManager(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // if (loading) {
  //   return (
  //     <SafeAreaView>
  //       <Text>Loading...</Text>
  //     </SafeAreaView>
  //   );
  // }

  return (
    <View style={{ flex: 1 }}>
        <ActivityScreen data="PENDING" />
    </View>
  );
};

export default Activity;

const styles = StyleSheet.create({});
