import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';

const TestList2 = () => {
  // Initialize state for all rats with blood measurement fields
  const [ratData, setRatData] = useState([
    { id: 'R1', gender: 'Male', measurements: { glucose: '', cholesterol: '', hemoglobin: '', creatinine: '', albumin: '', bilirubin: '' } },
    { id: 'R2', gender: 'Male', measurements: { glucose: '', cholesterol: '', hemoglobin: '', creatinine: '', albumin: '', bilirubin: '' } },
    { id: 'R3', gender: 'Male', measurements: { glucose: '', cholesterol: '', hemoglobin: '', creatinine: '', albumin: '', bilirubin: '' } },
    { id: 'R4', gender: 'Male', measurements: { glucose: '', cholesterol: '', hemoglobin: '', creatinine: '', albumin: '', bilirubin: '' } },
    { id: 'R5', gender: 'Male', measurements: { glucose: '', cholesterol: '', hemoglobin: '', creatinine: '', albumin: '', bilirubin: '' } },
    { id: 'R6', gender: 'Female', measurements: { glucose: '', cholesterol: '', hemoglobin: '', creatinine: '', albumin: '', bilirubin: '' } },
    { id: 'R7', gender: 'Female', measurements: { glucose: '', cholesterol: '', hemoglobin: '', creatinine: '', albumin: '', bilirubin: '' } },
    { id: 'R8', gender: 'Female', measurements: { glucose: '', cholesterol: '', hemoglobin: '', creatinine: '', albumin: '', bilirubin: '' } },
    { id: 'R9', gender: 'Female', measurements: { glucose: '', cholesterol: '', hemoglobin: '', creatinine: '', albumin: '', bilirubin: '' } },
    { id: 'R10', gender: 'Female', measurements: { glucose: '', cholesterol: '', hemoglobin: '', creatinine: '', albumin: '', bilirubin: '' } }
  ]);

  // Blood measurement fields configuration
  const measurementFields = [
    { key: 'glucose', label: 'Glucose', unit: 'mg/dL', normalRange: '70-110' },
    { key: 'cholesterol', label: 'Total Cholesterol', unit: 'mg/dL', normalRange: '40-130' },
    { key: 'hemoglobin', label: 'Hemoglobin', unit: 'g/dL', normalRange: '12-18' },
    { key: 'creatinine', label: 'Creatinine', unit: 'mg/dL', normalRange: '0.2-0.8' },
    { key: 'albumin', label: 'Albumin', unit: 'g/dL', normalRange: '3.5-5.0' },
    { key: 'bilirubin', label: 'Total Bilirubin', unit: 'mg/dL', normalRange: '0.1-1.2' }
  ];

  // Update measurement value
  const updateMeasurement = (ratIndex, fieldKey, value) => {
    const updatedRatData = [...ratData];
    updatedRatData[ratIndex].measurements[fieldKey] = value;
    setRatData(updatedRatData);
  };

  // Save all measurements
  const saveAllMeasurements = () => {
    // Here you would typically save to your backend/database
    Alert.alert(
      'Success',
      'All blood measurements have been saved successfully!',
      [{ text: 'OK' }]
    );
    console.log('Saved measurements:', ratData);
  };

  // Clear all measurements
  const clearAllMeasurements = () => {
    Alert.alert(
      'Clear All Measurements',
      'Are you sure you want to clear all entered measurements?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            const clearedData = ratData.map(rat => ({
              ...rat,
              measurements: { glucose: '', cholesterol: '', hemoglobin: '', creatinine: '', albumin: '', bilirubin: '' }
            }));
            setRatData(clearedData);
          }
        }
      ]
    );
  };

  // Check if rat has any measurements entered
  const hasAnyMeasurements = (measurements) => {
    return Object.values(measurements).some(value => value.trim() !== '');
  };

  // Get completion status for a rat
  const getCompletionStatus = (measurements) => {
    const filledFields = Object.values(measurements).filter(value => value.trim() !== '').length;
    const totalFields = measurementFields.length;
    return { filled: filledFields, total: totalFields, percentage: (filledFields / totalFields) * 100 };
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Blood Chemistry Measurements</Text>
        <Text style={styles.headerSubtitle}>Enter blood test values for all test subjects</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.saveButton} onPress={saveAllMeasurements}>
          <Text style={styles.saveButtonText}>Save All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.clearButton} onPress={clearAllMeasurements}>
          <Text style={styles.clearButtonText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {ratData.map((rat, ratIndex) => {
          const status = getCompletionStatus(rat.measurements);
          
          return (
            <View key={rat.id} style={styles.ratCard}>
              {/* Rat Header */}
              <View style={styles.ratHeader}>
                <View style={styles.ratInfo}>
                  <Text style={styles.ratId}>{rat.id}</Text>
                  <Text style={styles.ratGender}>{rat.gender}</Text>
                </View>
                <View style={styles.progressInfo}>
                  <Text style={styles.progressText}>
                    {status.filled}/{status.total} fields
                  </Text>
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarBackground}>
                      <View 
                        style={[
                          styles.progressBarFill, 
                          { width: `${status.percentage}%` }
                        ]} 
                      />
                    </View>
                  </View>
                </View>
              </View>

              {/* Measurement Fields */}
              <View style={styles.measurementsContainer}>
                {measurementFields.map((field, fieldIndex) => (
                  <View key={field.key} style={styles.measurementRow}>
                    <View style={styles.fieldInfo}>
                      <Text style={styles.fieldLabel}>{field.label}</Text>
                      <Text style={styles.normalRange}>Normal: {field.normalRange} {field.unit}</Text>
                    </View>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        value={rat.measurements[field.key]}
                        onChangeText={(value) => updateMeasurement(ratIndex, field.key, value)}
                        keyboardType="numeric"
                        returnKeyType={fieldIndex === measurementFields.length - 1 ? 'done' : 'next'}
                      />
                      <Text style={styles.unit}>{field.unit}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Status Badge */}
              {/* {hasAnyMeasurements(rat.measurements) && (
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>
                    {status.percentage === 100 ? 'Complete' : 'In Progress'}
                  </Text>
                </View>
              )} */}
            </View>
          );
        })}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#22c55e',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  ratCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  ratHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  ratInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ratId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  ratGender: {
    fontSize: 14,
    color: '#64748b',
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  progressInfo: {
    alignItems: 'flex-end',
  },
  progressText: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  progressBarContainer: {
    width: 80,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  measurementsContainer: {
    padding: 16,
  },
  measurementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  fieldInfo: {
    flex: 1,
    marginRight: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
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
    minWidth: 120,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
    textAlign: 'center',
  },
  unit: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#22c55e',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default TestList2;