import axios from 'axios';

const api = axios.create({
  baseURL: 'https://finmen-mvp.onrender.com/api', // add :5000 here!
});

export const register = async (email, password) => {
  return api.post('/auth/register', { email, password });
};

export const login = async (email, password) => {
  return api.post('/auth/login', { email, password });
};