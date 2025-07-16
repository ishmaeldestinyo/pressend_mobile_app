import React, { useEffect, useRef } from 'react'
import { Animated, Image, View } from 'react-native'
import tw from 'twrnc'

function LoadingModal() {
  const scale = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.1, duration: 700, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start()
  }, [])

  return (
    <View style={tw`absolute top-0 left-0 right-0 bottom-0 bg-black/50 justify-center items-center z-50`}>
      <Animated.Image
        source={require('../../assets/images/logo.png')}
        style={[tw`w-24 h-24`, { transform: [{ scale }] }]}
        resizeMode="contain"
      />
    </View>
  )
}

export default LoadingModal
