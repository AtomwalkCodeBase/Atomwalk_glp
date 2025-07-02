import React, { useEffect, useState } from 'react';
import { View, Dimensions, TextInput, ScrollView, Alert } from 'react-native';
import styled from 'styled-components/native';
import { useRoute, useNavigation } from '@react-navigation/native';
import HeaderComponent from '../components/HeaderComponent';
import { LinearGradient } from 'expo-linear-gradient';
import { getActivitiQcData, postActivtyInventory } from '../services/productServices';
import SubmitButton from '../components/SubmitButton';
import { colors } from '../Styles/appStyle';

const { width, height } = Dimensions.get('window');

// Styled Components
const GradientBackground = styled.View`
  background-color: #f5f5f5;
  flex: 1;
`;

const Container = styled(ScrollView).attrs({
  showsVerticalScrollIndicator: false,
  showsHorizontalScrollIndicator: false,
})`
  flex: 1;
  padding: 20px;
  padding-bottom: 40px;
`;

const Title = styled.Text`
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
  color: #333;
`;

const Card = styled.View`
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 20px;
  padding: 20px;
  border: 1px solid #ddd;
  shadow-color: #000;
  shadow-opacity: 0.2;
  shadow-radius: 4px;
  elevation: 3;
`;

const BoldText = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #333;
`;

const SubText = styled.Text`
  font-size: 14px;
  color: #555;
  margin-top: 5px;
`;

const TextInputStyled = styled.TextInput`
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px;
  margin-top: 10px;
  font-size: 14px;
  width: 100%;
`;

const ActionButton = styled.TouchableOpacity`
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  background-color: ${colors.primary};
  padding: 12px 18px;
  border-radius: 6px;
  align-items: center;
`;

const ButtonContainer = styled.View`
  flex: 1;
`;


const ButtonText = styled.Text`
  color: #fff;
  font-size: 14px;
  font-weight: bold;
`;

const CheckboxContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 10px;
`;

const CheckboxLabel = styled.Text`
  margin-left: 8px;
  font-size: 14px;
  color: #555;
`;

// Main Component
const MarkCompleteScreen = (props) => {
  const id = props.id;
  const navigation = useNavigation();
  const [qcData, setQcData] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    fetchQcData();
  }, []);

  const data = {
    activity_id: id,
    call_mode: 'QC_DATA',
  };

  const handleBackPress = () => {
    navigation.goBack();
};

  const fetchQcData = async () => {
    try {
      const response = await getActivitiQcData(data);
      setQcData(response.data);
      setIsCompleted(response.data.isCompleted || false);
    } catch (error) {
      console.error('Error fetching QC data:', error);
    }
  };

  const handleMarkAsCompleted = async (item) => {
    const payload = {
      activity_id: id,
      call_mode: 'MARK_COMPLETE',
    };

    try {
      const res = await postActivtyInventory(payload);
      Alert.alert('Success', `Activity Completed Successfully`);
      handleBackPress();
    } catch (error) {
      Alert.alert(
        'Error',
        `Failed to update Activity. ${error.response?.data?.message || 'Please try again later.'}`
      );
    }
  };

  // const handleMarkAsCompleted = async () => {
  //   const payload = {
  //     activity_id: id,
  //     isCompleted: !isCompleted,
  //   };

  //   try {
  //     // const res = await postActivtyInventory(payload);
  //     setIsCompleted(!isCompleted);
  //     Alert.alert('Success', `Activity marked as ${!isCompleted ? 'completed' : 'incomplete'}`);
  //   } catch (error) {
  //     Alert.alert(
  //       'Error',
  //       `Failed to update activity status. ${error.response?.data?.message || 'Please try again later.'}`
  //     );
  //   }
  // };

  const handleInputChange = (index, value) => {
    const updatedData = [...qcData];
    updatedData[index].qc_actual = value;
    setQcData(updatedData);
  };

  return (
    
      <GradientBackground>
        <HeaderComponent headerTitle="Mark Activity Complete" onBackPress={navigation.goBack} />
        <ButtonContainer>
          <Container>
            {qcData.map((item, index) => (
              <Card key={index}>
                <BoldText>{item.qc_name}</BoldText>
                <SubText>Permissible Value: {item.qc_value}</SubText>
                {/* <TextInputStyled
                  placeholder="Enter actual value"
                  value={String(item.qc_actual || '')}
                  onChangeText={(value) => handleInputChange(index, value)}
                /> */}
                {/* <SubmitButton
                  label="Update QC Data"
                  onPress={() => handleUpdateQcData(item)}
                  bgColor={colors.primary}
                  textColor="white"
                /> */}
              </Card>
            ))}
          </Container>
          <ActionButton onPress={handleMarkAsCompleted}>
            <ButtonText>{isCompleted ? 'Unmark as Completed' : 'Mark as Completed'}</ButtonText>
          </ActionButton>
        </ButtonContainer>
      </GradientBackground>
    );
    
};

export default MarkCompleteScreen;
