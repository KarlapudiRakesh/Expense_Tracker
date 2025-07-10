
import axios from "axios";

const BASE_URL = "https://expense-tracker-b-mpun.onrender.com/api"; 

const token = localStorage.getItem("token");

export const publicRequest = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, 
});

export const userRequest = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    token: token,
  },
});
