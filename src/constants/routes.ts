
export enum AppRoutes {
  CreateWallet = "CreateWallet",
  Onboarding = 'Onboarding',
  ImportWallet = 'ImportWallet',
  Home = 'Home',
  SecurityDashboard = 'SecurityDashboard',
  Explorer = 'Explorer',
  BillPayment = 'Billpayment',
  TransferAssetList = 'TransferAssetList',
  RecieveAssetsList = 'RecieveAssetsList',
  WithdrawAssetList = 'WithdrawAssetList',
  ResetPassword = 'ResetPassword',
  ListTransaction = 'ListTransaction',
  SetTagname = 'SetTagname',
  ReportTransaction = 'ReportTransaction',
  ResetPasswordConfirmation = 'ResetPasswordConfirmation',
  OTPCode = 'OTPCode',
  SetPaymentPin = 'SetPaymentPin',
  SetPalmprint = 'SetPalmprint',
  DetailTransactionViaTagTransfer = 'DetailTransactionViaTagTransfer',
  EnableFingerprint = 'EnableFingerprint',
}

// Navigation param types (no params needed yet)
export type RootStackParamList = {
  [AppRoutes.Onboarding]: undefined;
  [AppRoutes.ImportWallet]: undefined;
  [AppRoutes.CreateWallet]: undefined;
  [AppRoutes.Home]: undefined;
  [AppRoutes.SecurityDashboard]: undefined;
  [AppRoutes.Explorer]: undefined;
  [AppRoutes.BillPayment]: undefined;
  [AppRoutes.TransferAssetList]: undefined;
  [AppRoutes.RecieveAssetsList]: undefined;
  [AppRoutes.ListTransaction]: undefined;
  [AppRoutes.ReportTransaction]: {data: string};
  [AppRoutes.WithdrawAssetList]: undefined;
  [AppRoutes.ResetPassword]: undefined;
  [AppRoutes.SetTagname]: undefined;
  [AppRoutes.DetailTransactionViaTagTransfer]: {data: string};
  [AppRoutes.SetPaymentPin]: undefined;
  [AppRoutes.EnableFingerprint]: undefined;
  [AppRoutes.SetPalmprint]: undefined;
  [AppRoutes.ResetPasswordConfirmation]: { email?: string; phone?: string; otp?: string };
  [AppRoutes.OTPCode]: { email?: string; phone?: string; from?: string }; 
};
