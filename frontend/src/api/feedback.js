import axios from 'axios';

const API_URL = 'http://localhost:5000/api/feedback';

export const createFeedback = (feedbackData) => {
  return axios.post(API_URL, feedbackData);
};

export const getFeedback = (filters = {}) => {
  return axios.get(API_URL, { params: filters });
};
