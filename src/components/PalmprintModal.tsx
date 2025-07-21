import tw from 'twrnc'
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native'
import Animated from 'react-native-reanimated'

export type PalmprintModalProps = {
    showPalmprintModal?: boolean,
    setShowPalmprintModal: (val: boolean) => void
}
function PalmprintModal({showPalmprintModal, setShowPalmprintModal}: PalmprintModalProps) {
    return (
        <Modal visible={showPalmprintModal} transparent animationType="fade">
            <Pressable
                style={tw`flex-1 bg-black/50`}
                onPress={() => setShowPalmprintModal(false)}
            >
                <View style={tw`flex-1 justify-end`}>
                    <Animated.View style={tw`bg-[#020618] rounded-t-2xl px-6 py-4 max-h-[40%]`}>
                        <Text style={tw`text-white text-center text-lg mb-4`}>Palmprint Confirmation</Text>
                        {/* Your palmprint modal content goes here */}
                        <TouchableOpacity
                            onPress={() => setShowPalmprintModal(false)}
                            style={tw`bg-blue-600 rounded-full py-3 mt-4`}
                        >
                            <Text style={tw`text-white text-center`}>Close</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Pressable>
        </Modal>
    )
}

export default PalmprintModal
