import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import LabBooking from '../../src/screens/LabBooking';
import Test from '../../src/screens/Test';

const index = () => {
  return (
	<View style={{ flex: 1}}>
		{/* <Test /> */}
			<LabBooking/>
	</View>
  )
}

export default index

const styles = StyleSheet.create({})