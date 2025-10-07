import React from "react";
import axios from "axios";

// viacep.com.br/ws/01001000/json/

const api = axios.create({
  baseURL: "http://10.0.2.2:8000/api/gacha-items",
    timeout: 1000,
    headers: { "Content-Type": "application/json" },
    responseType: "json",
});

export default api;