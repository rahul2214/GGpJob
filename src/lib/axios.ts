import axios from 'axios';

// Declare module to fix return types for interceptors
declare module 'axios' {
  export interface AxiosInstance {
    request<T = any, R = T, D = any>(config: AxiosRequestConfig<D>): Promise<R>;
    get<T = any, R = T, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
    delete<T = any, R = T, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
    head<T = any, R = T, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
    options<T = any, R = T, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
    post<T = any, R = T, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
    put<T = any, R = T, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
    patch<T = any, R = T, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
  }
}

const axiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for easy error handling
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Standardize error message
    const message = error.response?.data?.error || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export default axiosInstance;
