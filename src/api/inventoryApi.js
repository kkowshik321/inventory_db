import axios from "axios";

const InventoryAPI = axios.create({
  baseURL: "http://localhost:8000/gateway",
  headers: {
    "Content-Type": "application/json"
  }
});

export default InventoryAPI;