import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Automatically attach JWT token to every request
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('fs_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Redirect to login on 401
apiClient.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('fs_token');
            localStorage.removeItem('fs_user');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

// Auth
export const login = (phone, password) =>
    apiClient.post('/auth/login', { phone, password });

// Dashboard
export const getDashboard = () => apiClient.get('/dashboard');

// Transactions
export const getTransactions = (type = 'all') =>
    apiClient.get(`/transactions?type=${type}`);

// Deposits
export const getDeposits = () => apiClient.get('/deposits');
export const submitDeposit = (amount, method) =>
    apiClient.post('/deposits', { amount, method });

// Loans
export const getLoans = () => apiClient.get('/loans');
export const submitLoan = (amount, months) =>
    apiClient.post('/loans', { amount, months });

// Community
export const getCommunity = () => apiClient.get('/community');

// Profile
export const getProfile = () => apiClient.get('/profile');

export default apiClient;
