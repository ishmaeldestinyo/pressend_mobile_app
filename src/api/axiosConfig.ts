import axios from "axios";

const isEmulator = __DEV__; // React Native environment variable

export const axiosInstance = axios.create({
  baseURL: isEmulator
    ? 'http://10.0.2.2:8000'   // your local dev server port
    : 'https://loud-lilith-pressendltd-c0497041.koyeb.app',
  withCredentials: true,
});
