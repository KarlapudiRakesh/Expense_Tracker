import axios from "axios";

const BASE_URL = "https://expense-tracker-backend-url.onrender.com/api";

const token = localStorage.getItem("token");

export const publicRequest = axios.create({
  baseURL: BASE_URL,
});

export const userRequest = axios.create({
  baseURL: BASE_URL,
  headers: {
    token: token,
  },
});
