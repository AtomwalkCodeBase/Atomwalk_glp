import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { getActivityList } from '../services/productServices';
import { useRouter } from 'expo-router';
import HeaderComponent from '../components/HeaderComponent';

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
        
        // Sort activities: In progress first, then completed
        const sortedActivities = uniqueActivities.sort((a, b) => {
          const getStatusPriority = (status) => {
            switch (status?.toLowerCase()) {
              case 'in progress': return 1;
              case 'completed': return 2;
              default: return 3;
            }
          };
          return getStatusPriority(a.status) - getStatusPriority(b.status);
        });
        
        setActivities(sortedActivities);
      })
      .catch((err) => console.error('Error fetching activities', err));
  }, []);

  const handleSelectProject = (ref_num) => {
    router.push({
      pathname: 'GroupList',
      params: { ref_num },
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'in progress': return '#ea580c';
      case 'completed': return '#16a34a';
      default: return '#6366f1';
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.item, { borderLeftColor: getStatusColor(item.status) }]} 
      onPress={() => handleSelectProject(item.ref_num)}
      activeOpacity={0.8}
    >
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
        <Text style={styles.status}>{item.status}</Text>
      </View>
      
      <View style={styles.itemContent}>
        <View style={styles.projectInfo}>
          <Text style={styles.ref}>{item.ref_num}</Text>
          <Text style={styles.label}>Lab Project Reference</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <HeaderComponent headerTitle="Projects List" onBackPress={() => router.back()} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Select Project for Data Capture</Text>
          <Text style={styles.projectCount}>{activities.length} Projects Available</Text>
        </View>
        
        <FlatList
          data={activities}
          keyExtractor={(item) => item.activity_id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          style={styles.flatList}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 20,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  projectCount: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  listContainer: {
    paddingBottom: 20,
  },
  flatList: {
    flex: 1,
  },
  item: {
    backgroundColor: '#ffffff',
    marginBottom: 12,
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    position: 'relative',
  },
  itemContent: {
    marginTop: 18,
  },
  projectInfo: {
    flex: 1,
  },
  ref: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#1e293b',
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 70,
    alignItems: 'center',
  },
  status: { 
    fontSize: 11, 
    fontWeight: '600', 
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default ProjectList;