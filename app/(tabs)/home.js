import { useEffect, useState } from 'react';
import HomeScreen from '../../src/screens/HomeScreen';
import PinPopup from '../../src/screens/PinPopup';
import { getProfileInfo } from '../../src/services/authServices';
import { View } from 'react-native';

const Home = () => {
  
  useEffect(() => {
    getProfileInfo()
      .then((res) => {
        setProfile(res.data);
        setIsManager(res?.data?.user_group?.is_admin||res?.data?.user_group?.is_owner||res?.data?.user_group?.is_manager);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setIsManager(false);
      });
  }, []);

  return (
    <View style={{flex: 1}}>
      <HomeScreen />
      <PinPopup />
    </View>
  );
};
export default Home;
