import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: 'http://10.0.2.2:3000', // ✅ this connects the emulator to your host machine
  withCredentials: false,
});
