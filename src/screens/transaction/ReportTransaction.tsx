import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ToastAndroid,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import tw from 'twrnc';
import TopNavbar from '../../components/TopNavbar';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { AppRoutes, RootStackParamList } from '../../constants/routes';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LoadingModal from '../../components/LoadingModal';
import { axiosInstance } from '../../api/axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ReportTransactionRouteProp = RouteProp<RootStackParamList, AppRoutes.ReportTransaction>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ReportTransaction = () => {
    const route = useRoute<ReportTransactionRouteProp>();
    const navigation = useNavigation<NavigationProp>();
    const { data } = route.params;

    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!comment.trim()) {
            ToastAndroid.show('Please enter a comment.', ToastAndroid.SHORT);
            return;
        }

        try {
            setLoading(true);

            const token = await AsyncStorage.getItem("accessToken");
            const response = await axiosInstance.post(
                `/accounts/transactions/${data}`,
                { comment },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response?.status === 200) {
                ToastAndroid.show('Report submitted successfully!', ToastAndroid.SHORT);
                setTimeout(() => {
                    navigation.goBack();
                }, 800);
            }
        } catch (error: any) {
            console.error(error);
            const errorMessage =
                error?.response?.data?.message || 'Failed to submit report.';
            ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {loading && <LoadingModal />}
            <View style={tw`flex-1 bg-[#020618]`}>
                <TopNavbar title="Report Transaction" />

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={tw`flex-1`}
                >
                    <ScrollView style={tw`p-4`}>
                        <Text
                            selectable
                            style={tw`text-gray-400 mb-4 border border-gray-700 rounded p-2 text-xs`}
                        >
                            Transaction ID: {data}
                        </Text>

                        <Text style={tw`text-white mb-2 text-base`}>Comment:</Text>
                        <TextInput
                            multiline
                            numberOfLines={6}
                            value={comment}
                            onChangeText={setComment}
                            placeholder="Write your concern..."
                            placeholderTextColor="#888"
                            textAlignVertical="top"
                            style={tw`bg-gray-800 text-white p-3 rounded-lg text-sm min-h-32`}
                        />
                    </ScrollView>

                    <View style={tw`p-4`}>
                        <TouchableOpacity
                            style={tw.style(
                                'py-3 rounded-xl',
                                loading ? 'bg-red-400' : 'bg-red-600'
                            )}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            <Text style={tw`text-white text-center font-semibold`}>
                                Submit Report
                            </Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </>
    );
};

export default ReportTransaction;
