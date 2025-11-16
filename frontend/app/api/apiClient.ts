import axios from 'axios';

// jeśli testujesz na telefonie -> wpisujesz IP komputera
export const BASE_URL = "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: `${BASE_URL}/api/`,
  timeout: 5000,
});

export default api;
