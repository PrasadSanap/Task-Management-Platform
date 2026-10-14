import axios from 'axios';
export const api = axios.create({baseURL:import.meta.env.VITE_API_URL || 'http://localhost:5000/api',headers:{'Content-Type':'application/json'}});
api.interceptors.request.use(config=>{const token=localStorage.getItem('taskflow_token')||sessionStorage.getItem('taskflow_token');if(token)config.headers.Authorization=`Bearer ${token}`;return config;});
export function messageFromError(error){return error?.response?.data?.message || (error?.request ? 'Could not connect to the server. Check that the backend is running.' : error.message || 'Something went wrong.');}
