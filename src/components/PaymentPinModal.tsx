import tw from 'twrnc'
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import Animated, { FadeIn, FadeInUp, FadeOut } from 'react-native-reanimated'
import LottieView from 'lottie-react-native'

interface PaymentPinModalProps {
    showPinModal?: boolean,
    showSuccess?: boolean,
    setShowPinModal: (val: boolean) => void,
    tooltipMessage?: string;
    pin: string[],
    handlePinButtonPress: (val: string) => void,
    submitPin: () => void,
    handlePinBackspace: () => void,
}


function PaymentPinModal({ showPinModal, setShowPinModal, tooltipMessage, showSuccess, pin, handlePinButtonPress, submitPin, handlePinBackspace }: PaymentPinModalProps) {
    return (
        <Modal visible={showPinModal} transparent animationType="fade">
            <Pressable
                style={tw`flex-1 bg-black/50`}
                onPress={() => setShowPinModal(false)}
            >
                <View style={tw`flex-1 justify-end`}>
                    <Animated.View
                        style={tw`bg-[#020618] rounded-t-2xl px-6 py-4 max-h-[70%]`}
                    >
                        <ScrollView
                            contentContainerStyle={tw`items-center`}
                            showsVerticalScrollIndicator={false}
                        >
                            <Text style={tw`text-white text-lg text-center mb-4`}>Enter PIN</Text>

                            {/* Tooltip Message */}
                            {tooltipMessage !== '' && (
                                <Animated.View
                                    entering={FadeIn}
                                    exiting={FadeOut}
                                    style={tw`mb-3 bg-[#1e3a8a] px-4 py-2 rounded-full`}
                                >
                                    <Text style={tw`text-white text-sm text-center`}>
                                        {tooltipMessage}
                                    </Text>
                                </Animated.View>
                            )}
                            {showSuccess && (
                                <Animated.View
                                    entering={FadeInUp.duration(400)}
                                    style={tw`absolute z-50 bg-black/60 flex-1 justify-center items-center w-full h-full`}
                                >
                                    <LottieView
                                        source={require('../../assets/lotties/f8.json')}
                                        autoPlay
                                        loop={false}
                                        style={tw`w-4/5 h-72`}
                                    />
                                </Animated.View>
                            )}

                            {/* PIN display */}
                            <View style={tw`flex-row justify-between mb-6 w-full px-7`}>
                                {pin.map((digit, idx) => (
                                    <View
                                        key={idx}
                                        style={tw`w-14 h-14 border border-[#3c4464] rounded-md items-center justify-center`}
                                    >
                                        <Text style={tw`text-white text-2xl`}>
                                            {digit ? '•' : ''}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            {/* Number pad */}
                            <View style={tw`flex-row flex-wrap justify-center w-full px-4`}>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                    <TouchableOpacity
                                        key={num}
                                        onPress={() => handlePinButtonPress(num.toString())}
                                        style={tw`w-20 h-14 m-1 bg-gray-700 rounded-md items-center justify-center`}
                                    >
                                        <Text style={tw`text-white text-xl`}>{num}</Text>
                                    </TouchableOpacity>
                                ))}

                                {/* Pay button before 0 */}
                                <TouchableOpacity
                                    onPress={submitPin}
                                    style={tw`w-20 h-14 m-1 bg-green-600 rounded-md items-center justify-center`}
                                >
                                    <Text style={tw`text-white text-[16px] font-bold`}>Pay</Text>
                                </TouchableOpacity>

                                {/* Zero button */}
                                <TouchableOpacity
                                    onPress={() => handlePinButtonPress('0')}
                                    style={tw`w-20 h-14 m-1 bg-gray-700 rounded-md items-center justify-center`}
                                >
                                    <Text style={tw`text-white text-xl`}>0</Text>
                                </TouchableOpacity>

                                {/* Backspace button */}
                                <TouchableOpacity
                                    onPress={handlePinBackspace}
                                    style={tw`w-20 h-14 m-1 bg-red-600 rounded-md items-center justify-center`}
                                >
                                    <Text style={tw`text-white text-xl`}>⌫</Text>
                                </TouchableOpacity>
                            </View>


                            <TouchableOpacity
                                onPress={submitPin}
                                style={tw`mt-6 bg-blue-600 rounded-full py-3 w-full items-center`}
                            >
                                <Text style={tw`text-white font-bold text-sm`}>Submit</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </Animated.View>
                </View>
            </Pressable>
        </Modal>
    )
}

export default PaymentPinModal
