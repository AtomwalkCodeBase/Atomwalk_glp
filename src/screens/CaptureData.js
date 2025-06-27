import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Dropdown } from 'react-native-element-dropdown';
import HeaderComponent from '../components/HeaderComponent';
import { ProjectContext } from '../../context/ProjectContext';
import CaptureDataModal from '../components/CaptureDataModal';
import { postGLPTestData } from '../services/productServices';

const CaptureData = () => {
  const { ref_num, groupId: initialGroupId, test: testString, scheduleDate } = useLocalSearchParams();
  const router = useRouter();
  const {
    projectTitles,
    groupsByProject,
    getRatIds,
    getCapturedData,
    getCompletionStatus,
    getTestSchedule,
    CURRENT_DATE
  } = useContext(ProjectContext);

  const test = JSON.parse(testString);
  const projectTitle = projectTitles[ref_num] || ref_num;
  const groups = groupsByProject[ref_num] || [];
  const [selectedGroupId, setSelectedGroupId] = useState(Number(initialGroupId) || groups[0]?.id);
  const group = groups.find(g => g.id === selectedGroupId);
  const rats = group ? [...getRatIds(group).male, ...getRatIds(group).female] : [];
  const useModal = test.is_sub_type_applicable;
  const subTypes = test.test_sub_type_list || [];

  const [dataEntries, setDataEntries] = useState({});
  const [existingData, setExistingData] = useState({});
  const [editMode, setEditMode] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRat, setSelectedRat] = useState(null);
  const [completionStatus, setCompletionStatus] = useState({
    status: 'Pending',
    completedCount: 0,
    totalCount: 0
  });
  const [isValidScheduleDate, setIsValidScheduleDate] = useState(true);
  const [loading, setLoading] = useState(true);

  const formatDateForComparison = (date) => new Date(date).toISOString().split('T')[0];
  const isViewOnly = formatDateForComparison(scheduleDate) !== formatDateForComparison(CURRENT_DATE);

  useEffect(() => {
    const fetchData = async () => {
      if (!group || rats.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      
      try {
        const { scheduleDates } = getTestSchedule(test);
        const scheduleDateStr = formatDateForComparison(scheduleDate);
        const isValidDate = scheduleDates.some(date => formatDateForComparison(date) === scheduleDateStr);
        setIsValidScheduleDate(isValidDate);

        if (!isValidDate) {
          setLoading(false);
          return;
        }

        const allData = await getCapturedData(
          ref_num, 
          selectedGroupId, 
          useModal ? subTypes.map(st => st.id) : test.id,
          scheduleDate
        );

        const newDataEntries = {};
        const newExistingData = {};
        const newEditMode = {};

        rats.forEach(ratId => {
          const ratData = allData.filter(item => item.rat_no === ratId);
          
          if (useModal) {
            const subTypeData = subTypes.reduce((acc, subType) => {
              const record = ratData.find(
                item => item.test_type_id === subType.id && 
                       item.test_sub_type === subType.test_sub_type
              );
              acc[subType.test_sub_type] = record?.t_value || '';
              return acc;
            }, {});
            newDataEntries[ratId] = subTypeData;
            newExistingData[ratId] = Object.values(subTypeData).some(v => v !== '' && v !== null);
          } else {
            const ratRecord = ratData.find(item => item.test_type_id === test.id);
            const hasExistingData = ratRecord && ratRecord.t_value !== '' && ratRecord.t_value !== null;
            newDataEntries[ratId] = ratRecord?.t_value || '';
            newExistingData[ratId] = hasExistingData;
          }
          
          newEditMode[ratId] = false;
        });

        setDataEntries(newDataEntries);
        setExistingData(newExistingData);
        setEditMode(newEditMode);

        const status = await getCompletionStatus(ref_num, selectedGroupId, test.id, scheduleDate);
        setCompletionStatus(status);
      } catch (error) {
        Alert.alert('Error', 'Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedGroupId, ref_num, test.id, scheduleDate, rats.length]);

  const handleDataChange = (ratId, value) => {
    setDataEntries(prev => ({
      ...prev,
      [ratId]: value
    }));
  };

  const toggleEditMode = (ratId) => {
    setEditMode(prev => ({ ...prev, [ratId]: !prev[ratId] }));
  };

  const handleCancelEdit = async (ratId) => {
    setEditMode(prev => ({ ...prev, [ratId]: false }));
    try {
      const ratData = await getCapturedData(ref_num, selectedGroupId, test.id, scheduleDate, ratId);
      const ratRecord = ratData.find(item => item.test_type_id === test.id);
      setDataEntries(prev => ({ ...prev, [ratId]: ratRecord?.t_value || '' }));
    } catch (error) {
      Alert.alert('Error', 'Failed to reset data.');
    }
  };

  const handleSubmit = async () => {
    try {
      const formattedDate = new Date(scheduleDate)
        .toLocaleDateString('en-GB')
        .split('/')
        .join('-');

      const now = new Date();
      const hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      const currentTime = `${String(formattedHours).padStart(2, '0')}:${minutes} ${ampm}`;

      let submittedCount = 0;

      for (const ratId of rats) {
        const data = dataEntries[ratId];
        const hasData = data && (useModal ? Object.values(data).some(v => v !== '') : data !== '');

        if (hasData && (!existingData[ratId] || editMode[ratId])) {
          const isEdit = existingData[ratId] && editMode[ratId];
          const testValue = String(data);

          const payload = {
            test_type_id: test.id,
            call_mode: isEdit ? "UPDATE_TEST" : "ADD_TEST",
            group_id: selectedGroupId,
            test_name: test.name,
            rat_no: ratId,
            test_time: currentTime,
            test_date: formattedDate,
            test_value: useModal ? JSON.stringify(data) : testValue,
            remarks: `Data ${isEdit ? 'updated' : 'captured'} via mobile app`
          };

          await postGLPTestData(payload);

          setEditMode(prev => ({ ...prev, [ratId]: false }));
          setExistingData(prev => ({ ...prev, [ratId]: true }));
          submittedCount++;
        }else{
          console.log("Skipped")
        }
      }

      if (submittedCount > 0) {
        Alert.alert('Success', `${submittedCount} record(s) saved successfully`, [
          {
            text: 'OK',
            onPress: async () => {
              const completion = await getCompletionStatus(ref_num, selectedGroupId, test.id, scheduleDate, true);
              setCompletionStatus(completion);
              router.back({ refresh: 'true' });
            }
          }
        ]);
      } else {
        Alert.alert('Info', 'No new or modified data to submit');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save data. Please try again.');
    }
  };

  const handleCaptureData = (ratId) => {
    setSelectedRat(ratId);
    setModalVisible(true);
  };

  const handleModalSuccess = async () => {
    setLoading(true);
    try {
      const allData = await getCapturedData(
        ref_num, 
        selectedGroupId, 
        subTypes.map(st => st.id),
        scheduleDate
      );

      const subTypeData = subTypes.reduce((acc, subType) => {
        const record = allData.find(
          item => item.rat_no === selectedRat &&
                 item.test_type_id === subType.id && 
                 item.test_sub_type === subType.test_sub_type
        );
        acc[subType.test_sub_type] = record?.t_value || '';
        return acc;
      }, {});

      setDataEntries(prev => ({
        ...prev,
        [selectedRat]: subTypeData
      }));
      setExistingData(prev => ({
        ...prev,
        [selectedRat]: Object.values(subTypeData).some(v => v !== '' && v !== null)
      }));
      setEditMode(prev => ({ ...prev, [selectedRat]: false }));

      const completion = await getCompletionStatus(ref_num, selectedGroupId, test.id, scheduleDate, true);
      setCompletionStatus(completion);
    } catch (err) {
      Alert.alert('Error', 'Failed to refresh data.');
    } finally {
      setLoading(false);
      setModalVisible(false);
      setSelectedRat(null);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedRat(null);
  };

  const getSubTypeProgress = (ratId) => {
    if (!useModal) return null;
    const data = dataEntries[ratId] || {};
    const completed = Object.values(data).filter(v => v !== '' && v !== null).length;
    return `${completed}/${subTypes.length} completed`;
  };

  const isFullyCompleted = (ratId) => {
    if (!useModal) return existingData[ratId];
    const data = dataEntries[ratId] || {};
    const completed = Object.values(data).filter(v => v !== '' && v !== null).length;
    return completed === subTypes.length;
  };

  if (!group || rats.length === 0) {
    return (
      <View style={styles.container}>
        <HeaderComponent headerTitle="Capture Data" onBackPress={() => router.back()} />
        <View style={styles.headerSection}>
          <Text style={styles.headerText}>{`Project: ${projectTitle}`}</Text>
          <Text style={styles.headerText}>{`Test: ${test.name}`}</Text>
          <Text style={styles.headerText}>{`Schedule Date: ${new Date(scheduleDate).toLocaleDateString()}`}</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No rats assigned to this group.</Text>
        </View>
      </View>
    );
  }

  if (!isValidScheduleDate) {
    return (
      <View style={styles.container}>
        <HeaderComponent headerTitle="Capture Data" onBackPress={() => router.back()} />
        <View style={styles.headerSection}>
          <Text style={styles.headerText}>{`Project: ${projectTitle}`}</Text>
          <Text style={styles.headerText}>{`Test: ${test.name}`}</Text>
          <Text style={styles.headerText}>{`Group: ${group.study_type}`}</Text>
          <Text style={styles.headerText}>{`Schedule Date: ${new Date(scheduleDate).toLocaleDateString()}`}</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Invalid schedule date for this test frequency.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderComponent headerTitle="Capture Data" onBackPress={() => router.back()} />
      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0288d1" />
          <Text style={styles.loaderText}>Loading data...</Text>
        </View>
      )}
      {!loading && (
        <>
          <View style={styles.headerSection}>
            <Text style={styles.headerText}>{`Project: ${projectTitle}`}</Text>
            <Text style={styles.headerText}>{`Test: ${test.name}`}</Text>
            <Text style={styles.headerText}>{`Group: ${group.study_type}`}</Text>
            <Text style={styles.headerText}>{`Schedule Date: ${new Date(scheduleDate).toLocaleDateString()}`}</Text>
            <View style={styles.completionStatus}>
              <Text style={styles.completionText}>
                Completion: {completionStatus.completedCount}/{completionStatus.totalCount} (
                {completionStatus.totalCount > 0
                  ? Math.round((completionStatus.completedCount / completionStatus.totalCount) * 100)
                  : 0}%)
              </Text>
              <View style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    completionStatus.status === 'Completed' ? '#4CAF50' :
                      completionStatus.status === 'Pending' ? '#FF9800' : '#9E9E9E'
                }
              ]}>
                <Text style={styles.statusText}>{completionStatus.status}</Text>
              </View>
            </View>
          </View>
          <ScrollView style={styles.scrollView}>
            {!useModal ? (
              <>
                <View style={styles.ratsContainer}>
                  {rats.map(ratId => {
                    const isDisabled = isViewOnly || (existingData[ratId] && !editMode[ratId]);

                    return (
                      <View key={ratId} style={styles.ratRow}>
                        <Text style={styles.ratName}>{ratId}</Text>
                        <View style={styles.inputContainer}>
                          <TextInput
                            style={[styles.input, isDisabled && styles.disabledInput]}
                            value={dataEntries[ratId] || ''}
                            onChangeText={value => handleDataChange(ratId, value)}
                            placeholder={`Enter value`}
                            keyboardType={test.test_unit === 'g' ? 'numeric' : 'default'}
                            editable={!isDisabled}
                          />
                          {test.test_unit && <Text style={styles.unit}>{test.test_unit}</Text>}
                        </View>
                        {!isViewOnly && existingData[ratId] && !editMode[ratId] && (
                          <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => toggleEditMode(ratId)}
                          >
                            <Text style={styles.buttonText}>Edit</Text>
                          </TouchableOpacity>
                        )}
                        {!isViewOnly && editMode[ratId] && (
                          <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => handleCancelEdit(ratId)}
                          >
                            <Text style={styles.buttonText}>Cancel</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })}
                </View>
                {!isViewOnly && (
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                  >
                    <Text style={styles.submitButtonText}>Submit</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <View style={styles.ratsContainer}>
                {rats.map(ratId => {
                  const isFullyCompletedRat = isFullyCompleted(ratId);
                  const showButton = !isViewOnly || (isViewOnly && isFullyCompletedRat);
                  const buttonText = isFullyCompletedRat ? 'View' : 'Capture Data';
                  const isDisabled = isViewOnly && !isFullyCompletedRat;
                  const progress = getSubTypeProgress(ratId);

                  return (
                    <View key={ratId} style={styles.ratRow}>
                      <View style={styles.ratInfo}>
                        <Text style={styles.ratName}>{ratId}</Text>
                        {progress && <Text style={styles.progressText}>{progress}</Text>}
                      </View>
                      {showButton && (
                        <View style={styles.buttonContainer}>
                          <TouchableOpacity
                            style={[styles.captureButton, isDisabled && styles.disabledButton]}
                            onPress={() => handleCaptureData(ratId)}
                            disabled={isDisabled}
                          >
                            <Text style={styles.captureButtonText}>{buttonText}</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>
          {useModal && selectedRat && (
            <CaptureDataModal
              visible={modalVisible}
              ratId={selectedRat}
              subTypes={subTypes}
              onClose={handleModalClose}
              isDisabled={isViewOnly}
              groupId={selectedGroupId}
              testId={test.id}
              testName={test.name}
              scheduleDate={scheduleDate}
              onSuccess={handleModalSuccess}
              refNum={ref_num}
            />
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  headerSection: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerText: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 5,
  },
  completionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingVertical: 8,
  },
  completionText: {
    fontSize: 14,
    color: '#64748b',
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  ratsContainer: {
    padding: 15,
  },
  ratRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
  },
  ratInfo: {
    flex: 1,
    marginRight: 10,
  },
  ratName: {
    fontSize: 16,
    color: '#333',
    marginRight: 20,
  },
  progressText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 5,
    padding: 8,
    flex: 1,
    fontSize: 14,
    backgroundColor: '#fff',
    textAlign: 'right'
  },
  disabledInput: {
    opacity: 0.5,
  },
  unit: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
  },
  captureButton: {
    backgroundColor: '#0288d1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  editButton: {
    backgroundColor: '#ff9800',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    marginLeft: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  captureButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    margin: 15,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#dc3545',
    textAlign: 'center',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 5,
    padding: 8,
    flex: 1,
    fontSize: 14,
    backgroundColor: '#fff',
    flexShrink: 1,
    minWidth: 100,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#64748b',
  },
});

export default CaptureData;