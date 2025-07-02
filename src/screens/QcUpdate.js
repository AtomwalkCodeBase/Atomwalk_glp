import React, { useEffect, useState } from 'react';
import { View, Dimensions, ScrollView, Alert } from 'react-native';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import HeaderComponent from '../components/HeaderComponent';
import { LinearGradient } from 'expo-linear-gradient';
import { getActivitiQcData, postActivtyInventory } from '../services/productServices';
import SubmitButton from '../components/SubmitButton';
import { colors } from '../Styles/appStyle';
import EmptyMessage from '../components/EmptyMessage';
import SuccessModal from '../components/SuccessModal';

const { width } = Dimensions.get('window');

// Styled Components
const GradientBackground = styled.View`
  background-color: #f5f5f5;
  flex: 1;
`;

const Container = styled(ScrollView).attrs({
  showsVerticalScrollIndicator: false,
})`
  padding: 15px;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: ${colors.primary};
  margin-bottom: 10px;
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

const ButtonContainer = styled.View`
  margin: 0 10px 10px;
`;

const TextInputStyled = styled.TextInput`
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px;
  margin-top: 10px;
  font-size: 14px;
  width: 100%;
`;

const QcUpdate = (props) => {
  const id = props.id;
  const navigation = useNavigation();
  const [qcData, setQcData] = useState([]);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

  useEffect(() => {
    fetchQcData();
  }, []);

  const data = {
    activity_id: id,
    call_mode: 'QC_DATA',
  };

  const fetchQcData = async () => {
    try {
      const response = await getActivitiQcData(data);
      setQcData(response.data);
    } catch (error) {
      console.error('Error fetching QC data:', error);
    }
  };

  const handleUpdateQcData = async () => {
    const payload = {
      activity_id: id,
      call_mode: 'QC_DATA',
      qc_data: qcData,
    };

    try {
      const res = await postActivtyInventory(payload);
      setIsSuccessModalVisible(true);
    } catch (error) {
      console.error('Error updating QC data:', error);
      Alert.alert('Error', 'Failed to update QC data. Please try again later.');
    }
  };

  const handleInputChange = (index, value) => {
    const updatedData = [...qcData];
    updatedData[index].qc_actual = value;
    setQcData(updatedData);
  };

  const renderQcItems = (type, title) => {
    const filteredData = qcData.filter((item) => item.qc_type === type);

    if (filteredData.length === 0) {
      return null;
    }

    return (
      <>
        <SectionTitle>{title}</SectionTitle>
        {filteredData.map((item, index) => (
          <Card key={`${type}-${index}`}>
            <BoldText>{item.qc_name}</BoldText>
            <SubText>Permissible Value: {item.qc_value}</SubText>
            <TextInputStyled
              placeholder="Enter actual value"
              value={String(item.qc_actual || '')}
              onChangeText={(value) => handleInputChange(index, value)}
            />
          </Card>
        ))}
      </>
    );
  };

  return (
    <GradientBackground>
      <HeaderComponent headerTitle="Quality Check Data" onBackPress={navigation.goBack} />
      <Container>
        {qcData.length === 0 ? (
          <EmptyMessage data="Quality Check" />
        ) : (
          <>
            {renderQcItems('QB', 'QC Before')}
            {renderQcItems('QA', 'QC After')}
          </>
        )}
      </Container>
      <ButtonContainer>
      <SubmitButton
          label="Update QC Data"
          onPress={handleUpdateQcData}
          bgColor={colors.primary}
          textColor="white"
        />
      </ButtonContainer>
      <SuccessModal
        visible={isSuccessModalVisible}
        onClose={() => setIsSuccessModalVisible(false)}
        message="QC data updated successfully!"
      />
    </GradientBackground>
  );
};

export default QcUpdate;
