import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://firewatch-backend.onrender.com', // change for prod
  withCredentials: true
});

export default instance;