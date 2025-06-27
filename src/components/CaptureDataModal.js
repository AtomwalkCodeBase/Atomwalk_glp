import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
import { ProjectContext } from '../../context/ProjectContext';
import { postGLPTestData } from '../services/productServices';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const CaptureDataModal = ({
  visible,
  ratId,
  subTypes = [],
  onClose,
  isDisabled,
  groupId,
  testId,
  testName,
  scheduleDate,
  refNum,
  onSuccess = () => {},
}) => {
  const { getCapturedData, updateCompletionCache } = useContext(ProjectContext);
  const [initialData, setInitialData] = useState({});
  const [modalData, setModalData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [changedFields, setChangedFields] = useState({});

  useEffect(() => {
    if (visible && ratId && refNum && groupId && scheduleDate) {
      const fetchExistingData = async () => {
        try {
          // Fetch test data for the rat, group, and schedule date
          const testData = await getCapturedData(refNum, groupId, null, scheduleDate, ratId);

          // Map test data to subTypes based on test_type_id and test_sub_type
          const initial = subTypes.reduce((acc, subType) => {
            const record = testData.find(
              item => item.test_type_id === subType.id && item.test_sub_type === subType.test_sub_type
            );
            acc[subType.test_sub_type] = record?.t_value || '';
            return acc;
          }, {});

          setInitialData(initial);
          setModalData(initial);
          setChangedFields({});
        } catch (error) {
          Alert.alert('Error', 'Failed to load existing data.');
        }
      };

      fetchExistingData();
    }
  }, [visible, ratId, refNum, groupId, scheduleDate, subTypes, getCapturedData]);

  const handleInputChange = (subType, value) => {
    setModalData(prev => ({
      ...prev,
      [subType]: value,
    }));
    if (isEditing) {
      setChangedFields(prev => ({
        ...prev,
        [subType]: true,
      }));
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setModalData(initialData); // Revert to initial data
    setIsEditing(false);
    setChangedFields({});
  };

  const handleSubmit = async () => {
    if (!modalData || Object.values(modalData).every(v => v === '' || v === null)) {
      Alert.alert('Info', 'No data to submit.');
      return;
    }

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

      for (const subType of subTypes) {
        const value = modalData[subType.test_sub_type];
        const initialValue = initialData[subType.test_sub_type] || '';
        const isChanged = changedFields[subType.test_sub_type];

        // Submit if: new value is non-empty and initial value is empty (new data),
        // or if editing and the field was changed
        if (
          (value && value.trim() !== '' && (initialValue === '' || initialValue === null)) ||
          (isEditing && isChanged && value && value.trim() !== '')
        ) {
          const payload = {
            test_type_id: subType.id,
            call_mode: 'ADD_TEST',
            group_id: groupId,
            test_name: subType.test_sub_type,
            rat_no: ratId,
            test_time: currentTime,
            test_date: formattedDate,
            test_value: String(value),
            remarks: `Data ${isEditing ? 'updated' : 'captured'} via mobile app`,
          };

          // console.log(`Submitting for ${ratId}, payload is`, payload)
          await postGLPTestData(payload);
          submittedCount++;
        }
      }

      if (submittedCount > 0) {
        Alert.alert('Success', `${submittedCount} record(s) successfully ${isEditing ? 'updated' : 'saved'}`, [
          {
            text: 'OK',
            onPress: async () => {
              await onSuccess(modalData);
              await updateCompletionCache(refNum, groupId, testId, scheduleDate, null);
              setIsEditing(false);
              setChangedFields({});
              onClose();
            },
          },
        ]);
      } else {
        Alert.alert('Info', 'No new or updated data to submit.');
        setIsEditing(false);
        onClose();
      }
    } catch (error) {
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'submit'} data. Please try again.`);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={onClose}
        >
          <View
            style={styles.modalContainer}
            onStartShouldSetResponder={() => true}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{`Enter Data for ${ratId}`}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            {/* Input Fields */}
            <ScrollView
              style={styles.measurementsContainer}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.measurementsContent}
            >
              {subTypes.map((subType, index) => {
                const normalRange =
                  subType.low_range && subType.high_range
                    ? `${subType.low_range} - ${subType.high_range} ${subType.test_unit || ''}`
                    : '';
                const unit = subType.test_unit || '';
                const isSubTypeDisabled =
                  !isEditing &&
                  (isDisabled ||
                    (initialData[subType.test_sub_type] &&
                      initialData[subType.test_sub_type] !== '' &&
                      initialData[subType.test_sub_type] !== null));

                return (
                  <View key={subType.test_sub_type} style={styles.measurementRow}>
                    <View style={styles.fieldInfo}>
                      <Text style={styles.fieldLabel}>{subType.test_sub_type}</Text>
                      {normalRange && (
                        <Text style={styles.normalRange}>{normalRange}</Text>
                      )}
                    </View>
                    <View
                      style={[
                        styles.inputContainer,
                        isSubTypeDisabled && styles.disabledInputContainer,
                      ]}
                    >
                      <TextInput
                        style={styles.input}
                        placeholder="Enter value"
                        placeholderTextColor="#64748b"
                        value={modalData[subType.test_sub_type] || ''}
                        onChangeText={(value) => handleInputChange(subType.test_sub_type, value)}
                        keyboardType="numeric"
                        editable={!isSubTypeDisabled}
                        returnKeyType={index === subTypes.length - 1 ? 'done' : 'next'}
                      />
                      {unit && <Text style={styles.unit}>{unit}</Text>}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
            {/* Edit/Cancel and Submit/Update Buttons */}
            {!isDisabled && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={isEditing ? styles.cancelButton : styles.editButton}
                  onPress={isEditing ? handleCancel : handleEdit}
                >
                  <Text style={styles.buttonText}>
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={isEditing ? styles.updateButton : styles.submitButton}
                  onPress={handleSubmit}
                >
                  <Text style={styles.buttonText}>
                    {isEditing ? 'Update' : 'Submit'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouchable: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: Math.min(SCREEN_WIDTH * 0.9, 400),
    maxHeight: SCREEN_HEIGHT * 0.7,
    minHeight: 200,
    elevation: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginBottom: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  closeButton: {
    padding: 6,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#64748b',
  },
  measurementsContainer: {
    paddingHorizontal: 16,
  },
  measurementsContent: {
    paddingBottom: 10,
  },
  measurementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 4,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  fieldInfo: {
    flex: 1,
    marginRight: 12,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
    flexWrap: 'wrap',
  },
  normalRange: {
    fontSize: 12,
    color: '#64748b',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    minWidth: 170,
  },
  disabledInputContainer: {
    opacity: 0.7,
    backgroundColor: '#e5e7eb',
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 15,
    textAlign: 'left',
    color: '#1e293b',
  },
  unit: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 16,
    gap: 12,
  },
  editButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  cancelButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  updateButton: {
    backgroundColor: '#0288d1',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CaptureDataModal;