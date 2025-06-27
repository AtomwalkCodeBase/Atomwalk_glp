import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import HomeScreen from '../../src/screens/HomeScreen';
import PinPopup from '../../src/screens/PinPopup';
import { getProfileInfo } from '../../src/services/authServices';
import ManagerHomePage from '../../src/screens/ManagerHomeScreen';
import { Text } from 'react-native';

const Home = () => {
  const [isManager, setIsManager] = useState(false);
  const [profile, setProfile] = useState([]);
  const [loading, setLoading] = useState(true);
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
    <SafeAreaView>
      {isManager ? <ManagerHomePage /> : <HomeScreen />}
      <PinPopup />
    </SafeAreaView>
  );
};
export default Home;
