import { useEffect, useState } from 'react'
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import tw from 'twrnc';
import TopNavbar from '../../components/TopNavbar';

type BillsProps = {
  name: string;
  identifier: string;
  logo: any;
  provider: string
}
const defaultBills = [
    {
      name: "",
      identifier: 'Airtime',
      logo: require("../../../assets/images/btc.png"),
      provider: "MTN",
    },
    {
      name: "",
      identifier: 'Airtime',
      logo: require("../../../assets/images/btc.png"),
      provider: "Airtel",
    },
    {
      name: "",
      identifier: 'Airtime',
      logo: require("../../../assets/images/eth.png"),
      provider: "9Mobile",
    },
    {
      name: "",
      identifier: 'Airtime',
      logo: require("../../../assets/images/btc.png"),
      provider: "Glo",
    },
    {
      name: "",
      identifier: 'Data',
      provider: "MTN",
      logo: require("../../../assets/images/btc.png")
    },
    {
      name: "",
      identifier: 'Data',
      provider: "Airtel",
      logo: require("../../../assets/images/btc.png")
    },
    {
      name: "",
      identifier: 'Data',
      provider: "MTN",
      logo: require("../../../assets/images/btc.png")
    },
    {
      name: "",
      identifier: 'Electricity',
      provider: "EEDC",
      logo: require("../../../assets/images/btc.png")
    },
    {
      name: "",
      identifier: 'Electricity',
      provider: "EKO",
      logo: require("../../../assets/images/btc.png")
    },
    {
      name: "",
      identifier: 'Tv Cables',
      provider: "DsTv",
      logo: require("../../../assets/images/btc.png")
    },
    {
      name: "",
      identifier: 'Tv Cables',
      provider: "Strong",
      logo: require("../../../assets/images/btc.png")
    },
  ];

function ListBillPayment() {

  const [bills, setBills] = useState<BillsProps[]>(defaultBills);
  

  useEffect(() => {
    setBills(defaultBills);
  }, [])
  return (
    <View style={tw`flex-1 bg-[#020618]`}>
      <TopNavbar title='Bill Services' />
      <View style={tw`h-[0.5px] w-full bg-gray-800 mb-2`} />
      <ScrollView
      >
        {
          bills && bills.length > 0 && bills.map((bill, key) => (
            <View key={key}>
              <Text style={tw`text-white`}>{bill.identifier}</Text>
              <TouchableOpacity style={tw`flex-row flex-wrap`} onPress={() => { }}>
                <View>
                  <Image source={bill.logo} style={tw`h-8 w-8 rounded-full`} />
                  <Text style={tw`text-white mt-1`}>{bill.provider}</Text>
                </View>
              </TouchableOpacity>
            </View>
          ))
        }
      </ScrollView>
    </View>
  )
}

export default ListBillPayment
