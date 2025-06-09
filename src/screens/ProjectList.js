// app/CaptureProjectList.js

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { getActivityList } from '../services/productServices';
import { useRouter } from 'expo-router';

const ProjectList = () => {
  const [activities, setActivities] = useState([]);
  const router = useRouter();

  useEffect(() => {
    getActivityList()
      .then((res) => {
        const uniqueActivities = res?.data?.a_list.reduce((acc, current) => {
          const x = acc.find(item => item.ref_num === current.ref_num);
          if (!x) acc.push(current);
          return acc;
        }, []);
        setActivities(uniqueActivities);
      })
      .catch((err) => console.error('Error fetching activities', err));
  }, []);

  const handleSelectProject = (ref_num) => {
    router.push({
      pathname: 'GroupList',
      params: { ref_num },
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item} onPress={() => handleSelectProject(item.ref_num)}>
      <Text style={styles.ref}>{item.ref_num}</Text>
      <Text style={styles.status}>{item.status}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Select a Project to Capture Data</Text>
      <FlatList
        data={activities}
        keyExtractor={(item) => item.activity_id}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f2f2f2' },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
  },
  ref: { fontSize: 16, color: '#333' },
  status: { fontSize: 14, fontWeight: 'bold', color: '#e63946' },
});

export default ProjectList;
