import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Colors } from '../constants/colors'
import { ArrowLeftIcon } from 'react-native-heroicons/outline'
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../constants/routes';


export type TopNavbarProps = {
    title?: string
}
export default function TopNavbar({ title }: TopNavbarProps) {

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    return (
        <View style={styles.navbar}>
            <TouchableOpacity onPress={() => navigation.canGoBack() && navigation.goBack()} hitSlop={8}>
                <ArrowLeftIcon size={24} color={Colors.textColor} />
            </TouchableOpacity>
            <Text style={styles.navTitle}>{title}</Text>
            <View style={{ width: 24 }} />
        </View>
    )
}

const styles = StyleSheet.create({
    navbar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    navTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textColor,
    },
})