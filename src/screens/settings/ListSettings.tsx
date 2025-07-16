import React from 'react'
import { Text, View } from 'react-native'

function ListSettings() {
  return (
    <View>

        <Text>
          Settings preconfiguration
          - prevent camera & screenrecording thread or on any custom recording thread
          - Panic account
          - Heir/Next preconfiguration
          - Biometrics Configuration
            - Palmprint enable/disable
            - Fingerprint enable/disable
              - Setup/disable Fingerprint, state amount in $ allow [default=$50]
          </Text>
        
      
    </View>
  )
}

export default ListSettings
