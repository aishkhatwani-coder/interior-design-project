import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

const authAxios = axios.create({
  baseURL: API_URL,
  withCredentials: true // allows sending and receiving secure session cookies
});

export const signupUser = (userData) => {
  return authAxios.post('/signup', userData);
};

export const loginUser = (userData) => {
  return authAxios.post('/login', userData);
};

export const getMe = () => {
  return authAxios.get('/me');
};

export const logoutUser = () => {
  return authAxios.post('/logout');
};