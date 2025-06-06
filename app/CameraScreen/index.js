import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import CameraScreen from '../../src/screens/CameraScreen'


const index = () => {
  return (
	<View style={{ flex: 1}}>
			<CameraScreen/>
	</View>
  )
}

export default index

const styles = StyleSheet.create({})