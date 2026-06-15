import { createContext, useState, useEffect } from "react";
import API from "../api/inventoryApi";

export const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalItems: 0,
    lowStocks: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all users from database
  const fetchUsers = async () => {
    try {
      const response = await API.get("/users");
      setUsers(response.data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users");
    }
  };

  // Fetch all items from database
  const fetchItems = async () => {
    try {
      const response = await API.get("/items");
      const raw = response.data;
      const arr = Array.isArray(raw) ? raw : raw?.value || [];
      const list = (arr || []).map(it => ({
        ...it,
        // normalize possible user reference
        userId: it.userId ?? it.user?.id ?? it.createdBy ?? it.createdById ?? null,
      }));
      setItems(list);
    } catch (err) {
      console.error("Error fetching items:", err);
      // Fallback to empty array if API fails
      setItems([]);
    }
  };

  // Fetch all locations from database
  const fetchLocations = async () => {
    try {
      const response = await API.get("/locations");
      const raw = response.data;
      const arr = Array.isArray(raw) ? raw : raw?.value || [];
      const list = (arr || []).map(loc => ({
        ...loc,
        userId: loc.userId ?? loc.user?.id ?? loc.ownerId ?? null,
      }));
      setLocations(list);
    } catch (err) {
      console.error("Error fetching locations:", err);
      // Fallback to empty array if API fails
      setLocations([]);
    }
  };

  // Fetch all inventory records from database
  const fetchInventory = async () => {
    try {
      const response = await API.get("/inventory");
      const raw = response.data;
      const arr = Array.isArray(raw) ? raw : raw?.value || [];
      const list = (arr || []).map(inv => ({
        ...inv,
        // normalize user reference
        userId: inv.userId ?? inv.user?.id ?? inv.createdById ?? null,
        // normalize stock fields
        stock: inv.stock ?? inv.quantity ?? inv.qty ?? 0,
        minimumStock: inv.minimumStock ?? inv.minimum_stock ?? inv.minStock ?? 0,
      }));

      setInventory(list);

      // Calculate low stocks (stock < 10)
      const lowStocks = list.filter(inv => Number(inv.stock) < 10).length;
      setStats(prev => ({ ...prev, lowStocks }));
    } catch (err) {
      console.error("Error fetching inventory:", err);
      // Fallback to empty array if API fails
      setInventory([]);
    }
  };

  // Fetch stats for admin dashboard
  const fetchStats = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchUsers(),
        fetchItems(),
        fetchLocations(),
        fetchInventory(),
      ]);
      
      // Update stats after fetching data
      const usersRes = await API.get("/users").catch(() => ({ data: [] }));
      const itemsRes = await API.get("/items").catch(() => ({ data: [] }));
      const inventoryRes = await API.get("/inventory").catch(() => ({ data: [] }));
      
      const lowStocks = (inventoryRes.data || []).filter(inv => inv.quantity < 10).length;
      
      setStats({
        totalUsers: (usersRes.data || []).length,
        totalItems: (itemsRes.data || []).length,
        lowStocks: lowStocks,
      });
      
      setError(null);
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  // Get items by user
  const getItemsByUser = (userId) => {
    if (userId === undefined || userId === null) return [];
    return items.filter(item => String(item.userId) === String(userId) || item.user?.id === userId);
  };

  // Get locations by user
  const getLocationsByUser = (userId) => {
    if (userId === undefined || userId === null) return [];
    return locations.filter(location => String(location.userId) === String(userId) || location.user?.id === userId);
  };

  // Get inventory by user
  const getInventoryByUser = (userId) => {
    if (userId === undefined || userId === null) return [];
    return inventory.filter(inv => String(inv.userId) === String(userId) || inv.user?.id === userId);
  };

  const addItem = async (item, userId) => {
    try {
      const response = await API.post("/items", { ...item, userId });
      setItems(prev => [...prev, response.data]);
    } catch (err) {
      console.error("Error adding item:", err);
      setItems(prev => [...prev, { ...item, id: Math.random(), userId }]);
    }
  };

  const addLocation = async (location, userId) => {
    try {
      const response = await API.post("/locations", { ...location, userId });
      setLocations(prev => [...prev, response.data]);
    } catch (err) {
      console.error("Error adding location:", err);
      setLocations(prev => [...prev, { ...location, id: Math.random(), userId }]);
    }
  };

  const addInventory = async (record, userId) => {
    try {
      const response = await API.post("/inventory", { ...record, userId });
      setInventory(prev => [...prev, response.data]);
      await fetchStats(); // Update stats after adding inventory
    } catch (err) {
      console.error("Error adding inventory:", err);
      setInventory(prev => [...prev, { ...record, id: Math.random(), userId }]);
    }
  };

  // Initialize by fetching data on mount
  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <InventoryContext.Provider
      value={{
        items,
        locations,
        inventory,
        users,
        stats,
        loading,
        error,
        addItem,
        addLocation,
        addInventory,
        fetchStats,
        getItemsByUser,
        getLocationsByUser,
        getInventoryByUser,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};
