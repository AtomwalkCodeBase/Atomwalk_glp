import { StyleSheet, View } from 'react-native'
import GroupList from '../../src/screens/GroupList';

const index = () => {
    return (
        <View style={{ flex: 1 }}>
            <GroupList />
        </View>
    )
}

export default index

const styles = StyleSheet.create({})