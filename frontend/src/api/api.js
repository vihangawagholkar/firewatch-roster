import axios from 'axios';

const instance = axios.create({
  baseURL: 'mongodb+srv://vihangawagholkar:24kFY3DRHb5mg7eq@firewatchcluster0.2raxmyc.mongodb.net/', // change for prod
  withCredentials: true
});

export default instance;