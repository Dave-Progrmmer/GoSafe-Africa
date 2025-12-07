import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use your Vercel deployed backend
// For local testing on Android emulator, use: 'http://10.0.2.2:3000/api/v1'
// For local testing on iOS simulator, use: 'http://localhost:3000/api/v1'
// For production/physical devices, use your Vercel URL:
const BASE_URL = 'https://gosafe-one.vercel.app/api/v1';

const apiClient = axios.create({
  baseURL: BASE_URL,

  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Add auth token to requests
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Don't retry if we're already checking for refresh token or if it's a specific auth route that shouldn't need a token
    // The verify-reset-otp route typically returns 401 for invalid OTP, which shouldn't trigger a token refresh
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('verify-reset-otp')) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        
        // If no refresh token, we can't refresh. Just return the original error.
        if (!refreshToken) {
            return Promise.reject(error);
        }

        const response = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        
        await AsyncStorage.setItem('accessToken', response.data.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Only clear storage if we actually tried to refresh and failed
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
             await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const api = {
  // Auth
  register: (email: string, password: string, name: string) =>
    apiClient.post('/auth/register', { email, password, name }).then(res => res.data),
  
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }).then(res => res.data),
  
  logout: (refreshToken: string) =>
    apiClient.post('/auth/logout', { refreshToken }).then(res => res.data),
  
  refresh: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refreshToken }).then(res => res.data),
  
  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }).then(res => res.data),
  
  verifyResetOTP: (email: string, otp: string) =>
    apiClient.post('/auth/verify-reset-otp', { email, otp }).then(res => res.data),
  
  resetPassword: (resetToken: string, newPassword: string) =>
    apiClient.post('/auth/reset-password', { resetToken, newPassword }).then(res => res.data),

  // Reports
  getReports: (params?: { lat?: number; lng?: number; radius?: number; status?: string }) =>
    apiClient.get('/reports', { params }).then(res => res.data),
  
  getReport: (id: string) =>
    apiClient.get(`/reports/${id}`).then(res => res.data),
  
  createReport: (data: {
    type: string;
    location: { coordinates: [number, number] };
    description: string;
    severity: number;
    photos?: string[];
  }) => apiClient.post('/reports', data).then(res => res.data),
  
  confirmReport: (id: string) =>
    apiClient.post(`/reports/${id}/confirm`).then(res => res.data),
  
  denyReport: (id: string) =>
    apiClient.post(`/reports/${id}/deny`).then(res => res.data),
  
  deleteReport: (id: string) =>
    apiClient.delete(`/reports/${id}`).then(res => res.data),
};

export default api;
