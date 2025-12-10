// frontend/app/api/apiClient.ts

import axios from "axios";

export const api = axios.create({
  //baseURL: "http://127.0.0.1:8000/api",
  baseURL: "http://10.185.191.57:8000/api",
});
