import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { ProjectContext } from '../../context/ProjectContext';
import { postGLPTestData } from '../services/productServices';
import ConfirmationModal from '../components/ConfirmationModal';
import SuccessModal from '../components/SuccessModal';
import ErrorModal from '../components/ErrorModal';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const CaptureSubtypeDataModal = ({
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
  onSuccessModalClose = () => {}
}) => {
  const { getCapturedData, updateCompletionCache } = useContext(ProjectContext);
  const [initialData, setInitialData] = useState({});
  const [modalData, setModalData] = useState({});
  const [remarks, setRemarks] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [changedFields, setChangedFields] = useState({});
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isViewMode, setIsViewMode] = useState(false);
  const [completionStatus, setCompletionStatus] = useState({
    completed: 0,
    total: subTypes.length
  });
  const [focusedSubType, setFocusedSubType] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible && ratId && refNum && groupId && scheduleDate) {
      const fetchExistingData = async () => {
        try {
          const testData = await getCapturedData(refNum, groupId, null, scheduleDate, ratId);

          const initial = subTypes.reduce((acc, subType) => {
            const record = testData.find(
              item => item.test_type_id === subType.id && item.test_sub_type === subType.test_sub_type
            );
            acc[subType.test_sub_type] = {
              value: record?.t_value || '',
              remark: record?.remarks || ''
            };
            return acc;
          }, {});

          setInitialData(initial);
          setModalData(initial);
          setRemarks(
            subTypes.reduce((acc, subType) => {
              acc[subType.test_sub_type] = initial[subType.test_sub_type].remark;
              return acc;
            }, {})
          );
          setChangedFields({});

          const completed = Object.values(initial).filter(item => item.value !== '' && item.value !== null).length;
          setCompletionStatus({
            completed,
            total: subTypes.length
          });

          setIsViewMode(isDisabled && completed === subTypes.length);
          setIsEditing(false);
        } catch (error) {
          setModalMessage('Failed to load existing data.');
          setShowErrorModal(true);
        }
      };

      fetchExistingData();
    }
  }, [visible, ratId, refNum, groupId, scheduleDate, subTypes, getCapturedData, isDisabled]);

  const handleInputChange = (subType, value) => {
    setModalData(prev => ({
      ...prev,
      [subType]: { ...prev[subType], value }
    }));
    if (isEditing || !initialData[subType]?.value) {
      setChangedFields(prev => ({
        ...prev,
        [subType]: true
      }));
    }
  };

  const handleRemarkChange = (subType, remark) => {
    setRemarks(prev => ({
      ...prev,
      [subType]: remark || ''
    }));
    setModalData(prev => ({
      ...prev,
      [subType]: { ...prev[subType], remark: remark || '' }
    }));
    if (isEditing || !initialData[subType]?.remark || initialData[subType]?.remark === '') {
      setChangedFields(prev => ({
        ...prev,
        [subType]: true
      }));
    }
  };

  const handleInputFocus = (subType) => {
    setFocusedSubType(subType);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsViewMode(false);
  };

  const handleCancel = () => {
    if (Object.keys(changedFields).length > 0) {
      setShowExitConfirm(true);
    } else {
      resetModal();
      onClose();
    }
  };

  const handleClose = () => {
    if (Object.keys(changedFields).length > 0) {
      setShowExitConfirm(true);
    } else {
      resetModal();
      onClose();
    }
  };

  const resetModal = () => {
    setModalData(initialData);
    setRemarks(
      subTypes.reduce((acc, subType) => {
        acc[subType.test_sub_type] = initialData[subType.test_sub_type].remark;
        return acc;
      }, {})
    );
    setIsEditing(false);
    setChangedFields({});
    setFocusedSubType(null);
    setIsViewMode(isDisabled && Object.values(initialData).filter(item => item.value !== '' && item.value !== null).length === subTypes.length);
  };

  const confirmExit = () => {
    setShowExitConfirm(false);
    resetModal();
    onClose();
  };

  const cancelExit = () => {
    setShowExitConfirm(false);
  };

  const handleSubmitConfirmation = () => {
    const hasChanges = Object.keys(changedFields).length > 0;
    if (!hasChanges) {
      setModalMessage('No changes detected to submit.');
      setShowErrorModal(true);
      return;
    }
    setShowSubmitConfirm(true);
  };

  const handleSubmit = async () => {
    setShowSubmitConfirm(false);
    setIsSubmitting(true);

    try {
      const formattedDate = new Date()
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
        const value = modalData[subType.test_sub_type]?.value;
        const remark = remarks[subType.test_sub_type] !== '' ? remarks[subType.test_sub_type] : '';
        const isChanged = changedFields[subType.test_sub_type];

        if (isChanged && value && value.trim() !== '') {
          const payload = {
            test_type_id: subType.id,
            call_mode: initialData[subType.test_sub_type]?.value ? 'UPDATE_TEST' : 'ADD_TEST',
            group_id: groupId,
            test_name: subType.test_sub_type,
            rat_no: ratId,
            test_time: currentTime,
            test_date: formattedDate,
            test_value: String(value),
            remarks: remark || `Data ${isEditing ? 'updated' : 'captured'} via mobile app`
          };

          console.log('Payload:', payload);
          await postGLPTestData(payload);
          submittedCount++;
        }
      }

      if (submittedCount > 0) {
        const completed = Object.values(modalData).filter(item => item.value !== '' && item.value !== null).length;
        setCompletionStatus({
          completed,
          total: subTypes.length
        });

        await updateCompletionCache(refNum, groupId, testId, scheduleDate, null);

        setModalMessage(`${submittedCount} record(s) successfully ${isEditing ? 'updated' : 'saved'}`);
        setShowSuccessModal(true);
      } else {
        setModalMessage('No valid data to submit.');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Submission error:', error);
      setModalMessage(`Failed to ${isEditing ? 'update' : 'submit'} data. Please try again.`);
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    resetModal();
    onClose();
    onSuccess();
    onSuccessModalClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={handleClose}
        >
          <View
            style={styles.modalContainer}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{`${isViewMode ? 'View' : 'Enter'} Data for ${ratId}`}</Text>
              <View style={styles.progressBadge}>
                <Text style={styles.progressText}>{`${completionStatus.completed}/${completionStatus.total}`}</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.measurementsContainer}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.measurementsContent}
            >
              {subTypes.map((subType) => {
                const normalRange =
                  subType.low_range && subType.high_range
                    ? `${subType.low_range} - ${subType.high_range} ${subType.test_unit || ''}`
                    : '';
                const unit = subType.test_unit || '';
                const isSubTypeDisabled = isViewMode ||
                  (!isEditing &&
                    (isDisabled ||
                      (initialData[subType.test_sub_type]?.value &&
                        initialData[subType.test_sub_type]?.value !== '' &&
                        initialData[subType.test_sub_type]?.value !== null)));
                const remark = remarks[subType.test_sub_type] !== '' ? remarks[subType.test_sub_type] : null;

                return (
                  <View key={subType.test_sub_type} style={styles.measurementRow}>
                    <View style={styles.rowTop}>
                      <View style={styles.subtypeLabelContainer}>
                        <Text style={styles.fieldLabel}>{subType.test_sub_type}</Text>
                        {normalRange ? (
                          <Text style={styles.normalRange}>{normalRange}</Text>
                        ) : null}
                      </View>

                      <View style={styles.inputWrapper}>
                        <TextInput
                          style={[styles.input, isSubTypeDisabled && styles.disabledInput]}
                          placeholder="Enter value"
                          placeholderTextColor="#64748b"
                          value={modalData[subType.test_sub_type]?.value || ''}
                          onChangeText={(value) => handleInputChange(subType.test_sub_type, value)}
                          onFocus={() => handleInputFocus(subType.test_sub_type)}
                          keyboardType="numeric"
                          editable={!isSubTypeDisabled}
                        />
                        {unit && <Text style={styles.unit}>{unit}</Text>}
                      </View>
                    </View>

                    <View style={styles.rowBottom}>
                      {remark && (
                        <View style={styles.remarkContainer}>
                          <Text style={styles.remarkText}>{remark}</Text>
                        </View>
                      )}
                      {focusedSubType === subType.test_sub_type && !isSubTypeDisabled && (
                        <View style={styles.remarkInputContainer}>
                          <TextInput
                            style={styles.remarkInput}
                            placeholder="Enter remarks"
                            placeholderTextColor="#64748b"
                            value={remarks[subType.test_sub_type] !== '' ? remarks[subType.test_sub_type] : ''}
                            onChangeText={(text) => handleRemarkChange(subType.test_sub_type, text)}
                            multiline
                            numberOfLines={2}
                          />
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            <View style={styles.buttonContainer}>
              {isViewMode ? (
                <TouchableOpacity
                  style={[styles.viewButton, { backgroundColor: '#cbd5e1' }]}
                  onPress={() => {}}
                  disabled={true}
                >
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
              ) : (
                <>
                  {!isDisabled && (
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={handleCancel}
                    >
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.submitButton, isSubmitting && styles.submittingButton]}
                    onPress={handleSubmitConfirmation}
                    disabled={isViewMode || isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text style={styles.buttonText}>Submit</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <ConfirmationModal
        visible={showSubmitConfirm}
        onConfirm={handleSubmit}
        onCancel={() => setShowSubmitConfirm(false)}
        message="Are you sure you want to submit these changes?"
        confirmText="Submit"
        cancelText="Cancel"
      />

      <ConfirmationModal
        visible={showExitConfirm}
        onConfirm={confirmExit}
        onCancel={cancelExit}
        message="Are you sure you want to exit? Your unsaved changes will be lost."
        confirmText="Exit"
        cancelText="Cancel"
      />

      <SuccessModal
        visible={showSuccessModal}
        message={modalMessage}
        onClose={handleSuccessModalClose}
        onAutoClose={handleSuccessModalClose}
        autoCloseDelay={3000}
      />

      <ErrorModal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        message={modalMessage}
      />
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
  progressBadge: {
    backgroundColor: '#0288d1',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  progressText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
    margin: 4,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  fieldInfo: {
    marginRight: 12,
    marginBottom: 8,
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
  input: {
    flex: 1,
    height: 40,
    fontSize: 15,
    textAlign: 'left',
    color: '#1e293b',
  },
  disabledInput: {
    opacity: 0.7,
    backgroundColor: '#e5e7eb',
  },
  unit: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  remarkContainer: {
    marginTop: 4,
  },
  remarkText: {
    marginTop: 6,
    fontSize: 14,
    color: '#64748b',
  },
  remarkInputContainer: {
    marginTop: 8,
  },
  remarkInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 8,
    fontSize: 15,
    color: '#1e293b',
    height: 60,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 16,
    gap: 12,
  },
  viewButton: {
    backgroundColor: '#0288d1',
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
  submittingButton: {
    backgroundColor: '#16a34a',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 6,
    backgroundColor: '#ffffff',
    minWidth: 160,
  },
  subtypeLabelContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 1,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  normalRange: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
});

export default CaptureSubtypeDataModal;