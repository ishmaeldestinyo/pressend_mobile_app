import { AppRoutes } from "../constants/routes";

export enum PaymentMode {
  CRYPTO = "CRYPTO",
  FIAT = "FIAT",
  TAG = "TAG",
}


export const capitalizeEachWord = (str: string) =>
  str.replace(/\b\w+\b/g, word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());



export const getHelpText = (confirmationMethod: string | null) => {
  switch (confirmationMethod) {
    case 'key':
      return 'Forgot pin?';
    case 'hand':
      return 'Reset palmprint';
    case 'fingerprint':
      return '';
    default:
      return '';
  }
};


export const handleGetHelpText = (navigation: any, confirmationMethod: string | null) => {
    switch (confirmationMethod) {
      case 'key':
        navigation.navigate(AppRoutes.SetPaymentPin)
        return;
      case 'hand':
        navigation.navigate(AppRoutes.SetPalmprint)
        return;
      case 'fingerprint':
        navigation.navigate(AppRoutes.EnableFingerprint);
        return;
      default:
        return '';
    }
  };