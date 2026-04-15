import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// Add token to headers
API.interceptors.request.use((req) => {
    if (localStorage.getItem('token')) {
        req.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
    }
    return req;
});

// Add response interceptor to handle token expiration/invalidity
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('name');
            // Force a reload to clear application state
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const login = (formData) => API.post('/auth/login', formData);
export const register = (formData) => API.post('/auth/register', formData);
export const fetchRegisteredUsers = () => API.get('/auth/users');
export const selectRegisteredUser = (userId) => API.post('/auth/select', { user_id: userId });
export const uploadFile = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return API.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};
export const fetchFiles = () => API.get('/files/list');
export const deleteFile = (fileId) => API.delete(`/files/delete/${fileId}`);
export const chatWithFile = (fileId, question) => API.post('/ai/chat', { file_id: fileId, question });
export const summarizeFile = (fileId) => API.post('/ai/summary', { file_id: fileId });
export const generateMCQ = (fileId) => API.post('/ai/mcq', { file_id: fileId });
