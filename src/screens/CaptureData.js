import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TextInput, BackHandler } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import HeaderComponent from '../components/HeaderComponent';
import { ProjectContext } from '../../context/ProjectContext';
import { CircleButton } from '../components/old_components/Button';
import SubmitButton from '../components/SubmitButton';
import TestDataModal from '../components/TestDataModal';
import { postGLPTestData } from '../services/productServices';
import ErrorModal from '../components/ErrorModal';
import SuccessModal from '../components/SuccessModal';
import ConfirmationModal from '../components/ConfirmationModal';
import CaptureDataHeader from '../components/CaptureDataHeader';
import CaptureSubtypeDataModal from '../components/CaptureSubtypeDataModal';

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
    currentDate
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
  const [remarks, setRemarks] = useState({});
  const [existingData, setExistingData] = useState({});
  const [initialData, setInitialData] = useState({ dataEntries: {}, remarks: {} });
  const [testDataModalVisible, setTestDataModalVisible] = useState(false);
  const [subtypeModalVisible, setSubtypeModalVisible] = useState(false);
  const [selectedRat, setSelectedRat] = useState(null);
  const [completionStatus, setCompletionStatus] = useState({
    status: 'Pending',
    completedCount: 0,
    totalCount: 0
  });
  const [isValidScheduleDate, setIsValidScheduleDate] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const formatDateForComparison = (date) => new Date(date).toISOString().split('T')[0];

  useEffect(() => {
    const backAction = () => {
      if (hasChanges) {
        setShowExitConfirm(true);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [hasChanges]);

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
        const newRemarks = {};
        const newExistingData = {};

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
            newRemarks[ratId] = ratData[0]?.remarks || 'No Remarks';
          } else {
            const ratRecord = ratData.find(item => item.test_type_id === test.id);
            const hasExistingData = ratRecord && ratRecord.t_value !== '' && ratRecord.t_value !== null;
            newDataEntries[ratId] = ratRecord?.t_value || '';
            newExistingData[ratId] = hasExistingData;
            newRemarks[ratId] = ratRecord?.remarks || 'No Remarks';
          }
        });

        setDataEntries(newDataEntries);
        setRemarks(newRemarks);
        setExistingData(newExistingData);
        setInitialData({
          dataEntries: JSON.parse(JSON.stringify(newDataEntries)),
          remarks: JSON.parse(JSON.stringify(newRemarks))
        });
        setHasChanges(false);

        const status = await getCompletionStatus(ref_num, selectedGroupId, test.id, scheduleDate);
        setCompletionStatus(status);
      } catch (error) {
        setModalMessage('Failed to load data. Please try again.');
        setShowErrorModal(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedGroupId, ref_num, test.id, scheduleDate, rats.length]);

  const checkForChanges = (newDataEntries, newRemarks) => {
    if (useModal) {
      return Object.keys(newDataEntries).some(ratId => {
        return JSON.stringify(newDataEntries[ratId]) !== JSON.stringify(initialData.dataEntries[ratId]) ||
          newRemarks[ratId] !== initialData.remarks[ratId];
      });
    } else {
      return Object.keys(newDataEntries).some(ratId => {
        return newDataEntries[ratId] !== initialData.dataEntries[ratId] ||
          newRemarks[ratId] !== initialData.remarks[ratId];
      });
    }
  };

  const handleDataSave = (ratId, value, remark) => {
    const formattedValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

    const newDataEntries = { ...dataEntries, [ratId]: formattedValue };
    const newRemarks = { ...remarks, [ratId]: remark || 'No Remarks' };

    setDataEntries(newDataEntries);
    setRemarks(newRemarks);
    setExistingData(prev => ({
      ...prev,
      [ratId]: formattedValue !== '' && formattedValue !== 'null' && formattedValue !== null
    }));

    const changesExist = checkForChanges(newDataEntries, newRemarks);
    setHasChanges(changesExist);

    setTestDataModalVisible(false);
    setSubtypeModalVisible(false);
    setSelectedRat(null);
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
        const initialDataEntry = initialData.dataEntries[ratId];
        const remark = remarks[ratId] !== 'No Remarks' ? remarks[ratId] : '';
        const initialRemark = initialData.remarks[ratId] !== 'No Remarks' ? initialData.remarks[ratId] : '';

        const hasChanged = useModal
          ? JSON.stringify(data) !== JSON.stringify(initialDataEntry) || remark !== initialRemark
          : data !== initialDataEntry || remark !== initialRemark;

        if (hasChanged) {
          const testValue = String(data);

          const payload = {
            test_type_id: test.id,
            call_mode: "ADD_TEST",
            group_id: selectedGroupId,
            test_name: test.name,
            rat_no: ratId,
            test_time: currentTime,
            test_date: formattedDate,
            test_value: useModal ? JSON.stringify(data) : testValue,
            remarks: remark || `Data captured via mobile app`
          };

          console.log("Payload", payload)
          await postGLPTestData(payload);

          setExistingData(prev => ({ ...prev, [ratId]: true }));
          submittedCount++;
        }
      }

      if (submittedCount > 0) {
        setModalMessage(`${submittedCount} record(s) saved successfully`);
        setShowSuccessModal(true);
        setHasChanges(false);

        setInitialData({
          dataEntries: JSON.parse(JSON.stringify(dataEntries)),
          remarks: JSON.parse(JSON.stringify(remarks))
        });

        const completion = await getCompletionStatus(ref_num, selectedGroupId, test.id, scheduleDate, true);
        setCompletionStatus(completion);
      } else {
        setModalMessage('No changes detected to submit');
        setShowErrorModal(true);
      }
    } catch (error) {
      setModalMessage('Failed to save data. Please try again.');
      setShowErrorModal(true);
    }
  };

  const handleBackPress = () => {
    if (hasChanges) {
      setShowExitConfirm(true);
    } else {
      router.back();
    }
  };

  const handleCaptureData = (ratId) => {
    setSelectedRat(ratId);
    if (useModal) {
      setSubtypeModalVisible(true);
    } else {
      setTestDataModalVisible(true);
    }
  };

  const handleModalClose = () => {
    setTestDataModalVisible(false);
    setSubtypeModalVisible(false);
    setSelectedRat(null);
  };

  const handleSubmitConfirmation = () => {
    setShowSubmitConfirm(true);
  };

  const confirmSubmit = () => {
    setShowSubmitConfirm(false);
    handleSubmit();
  };

  const confirmExit = () => {
    setShowExitConfirm(false);
    router.back();
  };

  const cancelExit = () => {
    setShowExitConfirm(false);
  };

  const getSubTypeProgress = (ratId) => {
    if (!useModal) return null;
    const data = dataEntries[ratId] || {};
    const completed = Object.values(data).filter(v => v !== '' && v !== null).length;
    return `${completed}/${subTypes.length} completed`;
  };

  if (!group || rats.length === 0) {
    return (
      <View style={styles.container}>
        <HeaderComponent headerTitle="Capture Data" onBackPress={handleBackPress} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No rats assigned to this group.</Text>
        </View>
      </View>
    );
  }

  if (!isValidScheduleDate) {
    return (
      <View style={styles.container}>
        <HeaderComponent headerTitle="Capture Data" onBackPress={handleBackPress} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Invalid schedule date for this test frequency.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderComponent headerTitle="Capture Data" onBackPress={handleBackPress} />

      <CaptureDataHeader
        projectTitle={projectTitle}
        testName={test.name}
        groupType={group.study_type}
        scheduleDate={scheduleDate}
        completionStatus={completionStatus}
      />

      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0288d1" />
          <Text style={styles.loaderText}>Loading data...</Text>
        </View>
      )}

      {!loading && (
        <>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContainer}
          >
            <View style={styles.ratsContainer}>
              {rats.map(ratId => {
                const hasData = existingData[ratId];
                const remark = remarks[ratId] !== 'No Remarks' ? remarks[ratId] : null;
                const progress = getSubTypeProgress(ratId);
                const displayValue = hasData ? String(dataEntries[ratId]) : '';

                return (
                  <View key={ratId} style={styles.ratRow}>
                    <View style={styles.ratRowContent}>
                      <Text style={styles.ratName}>{ratId}</Text>
                      <View style={styles.inputAndButtonContainer}>
                        {!useModal && hasData && (
                          <View style={styles.inputContainer}>
                            <TextInput
                              style={[styles.input, styles.disabledInput]}
                              value={displayValue}
                              editable={false}
                            />
                            {test.test_unit && <Text style={styles.unit}>{test.test_unit}</Text>}
                          </View>
                        )}
                        <CircleButton
                          text={useModal ? (hasData ? "View" : "Capture Data") : (hasData ? "Edit" : "Add")}
                          handlePress={() => handleCaptureData(ratId)}
                          style={hasData ? styles.disabledButton : useModal ? styles.captureButton : styles.addButton}
                          disabled={hasData}
                        />
                      </View>
                    </View>
                    {useModal && progress && (
                      <Text style={styles.progressText}>{progress}</Text>
                    )}
                    {remark && (
                      <View style={styles.remarkContainer}>
                        <Text style={styles.remarkText}>{remark}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </ScrollView>

          {!useModal && (
            <View style={styles.submitButtonWrapper}>
              <View style={styles.submitButtonBackground} />
              <View style={styles.submitButtonContainer}>
                <SubmitButton
                  label="Submit"
                  onPress={handleSubmitConfirmation}
                  bgColor="#22c55e"
                  textColor="#fff"
                />
              </View>
            </View>
          )}

          <TestDataModal
            visible={testDataModalVisible}
            ratId={selectedRat}
            testName={test.name}
            testUnit={test.test_unit}
            onClose={handleModalClose}
            onSave={(value, remark) => handleDataSave(selectedRat, value, remark)}
            initialValue={dataEntries[selectedRat] || ''}
            initialRemarks={remarks[selectedRat] !== 'No Remarks' ? remarks[selectedRat] : ''}
          />

          <CaptureSubtypeDataModal
            visible={subtypeModalVisible}
            ratId={selectedRat}
            subTypes={subTypes}
            onClose={handleModalClose}
            isDisabled={existingData[selectedRat]}
            groupId={selectedGroupId}
            testId={test.id}
            testName={test.name}
            scheduleDate={scheduleDate}
            refNum={ref_num}
            onSuccess={(data) => {
              handleDataSave(selectedRat, data, remarks[selectedRat] || 'No Remarks');
            }}
          />

          <ConfirmationModal
            visible={showExitConfirm}
            onConfirm={confirmExit}
            onCancel={cancelExit}
            message="Are you sure you want to exit? Your unsaved changes will be lost."
            confirmText="Exit"
            cancelText="Cancel"
          />

          <ConfirmationModal
            visible={showSubmitConfirm}
            onConfirm={confirmSubmit}
            onCancel={() => setShowSubmitConfirm(false)}
            message="Are you sure you want to submit these changes?"
            confirmText="Submit"
            cancelText="Cancel"
          />

          <SuccessModal
            visible={showSuccessModal}
            onClose={() => {
              setShowSuccessModal(false);
              router.back({ refresh: 'true' });
            }}
            message={modalMessage}
          />

          <ErrorModal
            visible={showErrorModal}
            onClose={() => setShowErrorModal(false)}
            message={modalMessage}
          />
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
  scrollContainer: {
    paddingBottom: 80,
  },
  scrollView: {
    flex: 1,
  },
  ratsContainer: {
    padding: 15,
    paddingBottom: 20,
  },
  ratRow: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
  },
  ratRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  inputAndButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 5,
    backgroundColor: '#fff',
    marginRight: 10,
    height: 40,
    minWidth: 140
  },
  input: {
    flex: 1,
    fontSize: 14,
    textAlign: 'right',
    paddingRight: 10,
    height: '100%',
  },
  disabledInput: {
    opacity: 0.8,
    color: '#222',
  },
  unit: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#0288d1',
    minWidth: 80,
  },
  captureButton: {
    backgroundColor: '#0288d1',
    minWidth: 120,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    minWidth: 80,
  },
  ratName: {
    fontSize: 16,
    color: '#333',
  },
  progressText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  remarkContainer: {
    marginTop: 4,
  },
  remarkText: {
    fontSize: 14,
    color: '#64748b',
  },
  submitButtonWrapper: {
    position: 'relative',
  },
  submitButtonBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  submitButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
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