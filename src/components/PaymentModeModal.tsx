import tw from 'twrnc'
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { FormatAmount } from '../utils/formatAmount';
import { getHelpText, handleGetHelpText } from '../utils/paymentUtil';
import { CheckCircleIcon, FingerPrintIcon, HandRaisedIcon, KeyIcon } from 'react-native-heroicons/outline';

type PaymentModeModalProps = {
    showPreview?: boolean,
    setShowPreview: (val: boolean) => void,
    tag: string,
    currency: any,
    amount: any,
    note: string,
    navigation: any,
    confirmationMethod: string | null,
    setConfirmationMethod: (val: string | null) => void,
    setShowPinModal: (val: boolean) => void,
    setShowFingerprintModal: (val: boolean) => void,
    setShowPalmprintModal: (val: boolean) => void,
}

function PaymentModeModal({ setShowPreview, showPreview, tag, currency, amount, note, confirmationMethod, navigation, setConfirmationMethod, setShowPinModal, setShowPalmprintModal, setShowFingerprintModal}: PaymentModeModalProps) {
    return (
        <Modal visible={showPreview} transparent animationType="fade">
            <Pressable style={tw`flex-1 bg-black/50`}>
                <View style={tw`flex-1 justify-end`}>
                    <Animated.View
                        style={tw`w-full bg-[#020618] px-6 pt-4 pb-[40px] rounded-t-2xl`}
                    >
                        <Pressable
                            style={tw`absolute z-50 left-1/2 top-3`}
                            onPress={() => setShowPreview(false)}
                            hitSlop={8}
                        >
                            <View style={tw`h-1.5 rounded-full w-16 mx-auto bg-[#2299fb]`} />
                        </Pressable>
                        <Text style={tw`text-center mt-4 text-white font-bold text-2xl mb-4`}>
                            {currency}
                            {FormatAmount(amount)}
                        </Text>

                        {tag ? (
                            <View
                                style={tw`mb-2 flex-row py-2 border-b border-gray-900 justify-between`}
                            >
                                <Text style={tw`text-gray-400 mb-1`}>Tag</Text>
                                <Text style={tw`text-white`}>{tag}</Text>
                            </View>
                        ) : null}

                        {note ? (
                            <View
                                style={tw`mb-4 flex-row py-2 border-b border-gray-900 justify-between`}
                            >
                                <Text style={tw`text-gray-400 mb-1`}>Note</Text>
                                <Text style={tw`text-white`}>
                                    {note.length > 5 ? note.slice(0, 7) + '...' : note}
                                </Text>
                            </View>
                        ) : null}

                        {confirmationMethod && (
                            <TouchableOpacity onPress={() => handleGetHelpText(navigation, confirmationMethod)}>
                                <Text style={tw`text-blue-400 my-4 text-center`}>{getHelpText(confirmationMethod)}</Text>
                            </TouchableOpacity>
                        )}

                        <View style={tw`flex-row justify-evenly pt-5 items-center`}>
                            {[
                                { key: 'fingerprint', Icon: FingerPrintIcon },
                                { key: 'hand', Icon: HandRaisedIcon },
                                { key: 'key', Icon: KeyIcon },
                            ].map(({ key, Icon }) => {
                                const isSelected = confirmationMethod === key;
                                return (
                                    <TouchableOpacity
                                        key={key}
                                        onPress={() => {
                                            setConfirmationMethod(key);
                                            setShowPreview(false);
                                            if (key === 'key') setShowPinModal(true);
                                            if (key === 'key') setShowPinModal(true);
                                            if (key === 'fingerprint') setShowFingerprintModal(true);
                                            if (key === 'hand') setShowPalmprintModal(true);

                                        }}
                                        style={tw`relative items-center justify-center p-3 rounded ${isSelected ? 'border border-[#2299fb]' : ''
                                            }`}
                                    >
                                        {isSelected && (
                                            <CheckCircleIcon
                                                style={tw`text-[#2299fb] absolute top-0.5 right-0.5`}
                                            />
                                        )}
                                        <Icon color="white" size={40} />
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </Animated.View>
                </View>
            </Pressable>
        </Modal>
    )
}

export default PaymentModeModal
