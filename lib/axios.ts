import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5001', // Mero Bazar Backend
    withCredentials: true, // Send cookies with requests
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle global errors here if needed
        if (error.response?.status === 401) {
            // Redirect to login if unauthorized and not already on login page
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
                // window.location.href = '/auth/login'; 
                // Commented out to prevent loops during initial dev, but good to have.
            }
        }
        return Promise.reject(error);
    }
);

export default api;
