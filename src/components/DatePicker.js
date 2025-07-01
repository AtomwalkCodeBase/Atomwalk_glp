import React, { useState } from 'react';
import { Platform, Text } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import styled from 'styled-components/native';
import { colors } from '../Styles/appStyle';

const DatePickerButton = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-width: 1px;
  border-color: #ccc;
  padding: 10px;
  border-radius: 5px;
`;

const FieldContainer = styled.View`
  margin-top: 5px;
`;

const DateText = styled.Text`
  font-size: 16px;
`;

const Label = styled.Text`
  font-size: 16px;
  margin-bottom: 5px;
`;

const Icon = styled.Image`
  width: 24px;
  height: 24px;
`;

// Convert to YYYY-MM-DD string in IST
const convertToISTFormattedString = (date) => {
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(date.getTime() + istOffset);
  const yyyy = istTime.getUTCFullYear();
  const mm = String(istTime.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(istTime.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Get today's date in YYYY-MM-DD (IST)
const getCurrentFormattedIST = () => {
  return convertToISTFormattedString(new Date());
};

const DatePicker = ({ error, label, cDate, setCDate }) => {
  const [showPicker, setShowPicker] = useState(false);

  const safeFormattedDate = cDate || getCurrentFormattedIST();

  const handleDateChange = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      const formatted = convertToISTFormattedString(selectedDate);
      setCDate(formatted); // Pass formatted date string directly
    }
  };

  return (
    <FieldContainer>
      <Label>{label}</Label>
      <DatePickerButton onPress={() => setShowPicker(true)}>
        <DateText>{safeFormattedDate}</DateText>
        <Icon source={require('../../assets/images/c-icon.png')} />
      </DatePickerButton>

      {showPicker && (
        <DateTimePicker
          value={new Date(safeFormattedDate)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}

      {error && (
        <Text style={{ marginTop: 7, color: colors.red, fontSize: 12 }}>
          {error}
        </Text>
      )}
    </FieldContainer>
  );
};

export default DatePicker;
