import DeviceInfo from 'react-native-device-info';
import { Dimensions } from 'react-native';

export const getDeviceDetails = async () => {
  return {
    device_model: await DeviceInfo.getModel(),
    device_brand: await DeviceInfo.getBrand(),
    device_id: await DeviceInfo.getUniqueId(),
    device_type: await DeviceInfo.getDeviceType(),
    os_name: await DeviceInfo.getSystemName(),
    os_version: await DeviceInfo.getSystemVersion(),
    app_version: await DeviceInfo.getVersion(),
    screen_height: Dimensions.get("screen").height,
    screen_width: Dimensions.get("screen").width,
    is_emulator: await DeviceInfo.isEmulator(),
    carrier: await DeviceInfo.getCarrier(),
  };
};
