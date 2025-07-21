import { Text, TouchableOpacity, View } from 'react-native'
import { ChevronUpDownIcon } from 'react-native-heroicons/outline'
import tw from 'twrnc';


type ListSortedItemProps = {
    title?: string
}

function ListSortedItem({ title = "Assets" }: ListSortedItemProps) {
    return (
        <View style={tw`flex-row justify-between items-center mb-4`}>
            <Text style={tw`text-white text-base pl-2 font-semibold`}>{title}</Text>

            <TouchableOpacity activeOpacity={0.7} style={tw`flex-row items-center`}>
                <ChevronUpDownIcon size={16} color="white" />
                <Text style={tw`text-white text-xs ml-1`}>Sort by</Text>
            </TouchableOpacity>
        </View>
    )
}

export default ListSortedItem
