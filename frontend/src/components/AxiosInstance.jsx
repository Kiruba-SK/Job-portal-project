import axios from 'axios';

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Choose the correct base URL based on environment
const myBaseUrl = isDevelopment
  ? process.env.REACT_APP_API_BASE_URL_LOCAL
  : process.env.REACT_APP_API_BASE_URL_DEPLOY;

const AxiosInstance = axios.create({
  baseURL: myBaseUrl,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export default AxiosInstance;
export const BASE_URL = myBaseUrl;