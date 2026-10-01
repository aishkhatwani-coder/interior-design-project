import axios from 'axios';

const API_URL = 'http://localhost:5000/api/portfolio';

export const getPortfolioItems = (filters = {}) => {
  return axios.get(API_URL, { params: filters });
};

export const getPortfolioItemById = (id) => {
  return axios.get(`${API_URL}/${id}`);
};