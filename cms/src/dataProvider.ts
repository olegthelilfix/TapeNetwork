import axios from "axios";
import simpleRestProvider from "@refinedev/simple-rest";

export const API_URL =
  import.meta.env.VITE_ADMIN_API_URL ?? "http://localhost:8080/api/admin";

export const TOKEN_KEY = "tape_token";

export const axiosInstance = axios.create();

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const dataProvider = simpleRestProvider(API_URL, axiosInstance);
