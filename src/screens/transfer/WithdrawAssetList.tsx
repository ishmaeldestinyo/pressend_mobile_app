import React from 'react'
import { View } from 'react-native'
import tw from 'twrnc';
import TopNavbar from '../../components/TopNavbar';

function WithdrawAssetList() {
  return (
     <View style={tw`bg-[#020618] flex-1`}>
      <TopNavbar title='Withdraw'/>
    </View>
  )
}

export default WithdrawAssetList
