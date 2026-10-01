import axios from 'axios';

const API_URL = 'http://localhost:5000/api/payments';

export const createPayment = (paymentData) => {
  return axios.post(API_URL, paymentData);
};

export const getPayments = (filters = {}) => {
  return axios.get(API_URL, { params: filters });
};

export const getPaymentById = (id) => {
  return axios.get(`${API_URL}/${id}`);
};
