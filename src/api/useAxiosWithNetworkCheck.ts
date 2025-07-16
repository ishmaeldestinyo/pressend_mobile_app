import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { useContext } from 'react';
import { axiosInstance } from './axiosConfig'; // your custom axios instance
import { showNoInternetToast } from '../utils/networkGlobalHelper';
import { NetworkContext } from '../context/NetworkContext';

export const useAxiosWithNetworkCheck = () => {
  const { isConnected } = useContext(NetworkContext);

  const axiosRequest = async <T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T> | null> => {
    // ✅ Check network connection via context (Wi-Fi or mobile data)
    if (!isConnected) {
      showNoInternetToast(); // No internet: show toast
      return null;
    }

    try {
      // Proceed with the request using custom axios instance
      const response = await axiosInstance(config);
      return response;
    } catch (error: any) {
      // Handle no internet/mobile data or dropped connection cases
      const isOfflineError = !error.response && error.message === 'Network Error';

      if (isOfflineError) {
        showNoInternetToast();
        return null;
      }

      // Unexpected error (e.g. 500, 400): rethrow to be handled upstream
      throw error;
    }
  };

  return { axiosRequest };
};
