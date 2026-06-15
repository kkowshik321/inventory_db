import axios from "axios";

const AuthAPI = axios.create({
  baseURL: "http://localhost:8000/gateway/auth",
});

export default AuthAPI;