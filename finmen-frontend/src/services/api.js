import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.0.109:5000/api', // add :5000 here!
});

export const register = async (email, password) => {
  return api.post('/auth/register', { email, password });
};

export const login = async (email, password) => {
  return api.post('/auth/login', { email, password });
};
