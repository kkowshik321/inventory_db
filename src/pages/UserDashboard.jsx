import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { InventoryContext } from "../context/InventoryContext";

function UserDashboard() {
  const { user } = useContext(AuthContext);
  const {
    items: ctxItems,
    locations: ctxLocations,
    inventory: ctxInventory,
    fetchStats,
    getItemsByUser,
    getLocationsByUser,
    getInventoryByUser,
    addItem,
    addLocation,
    addInventory,
  } = useContext(InventoryContext);

  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [pendingItems, setPendingItems] = useState([]);
  const [pendingLocations, setPendingLocations] = useState([]);
  const [pendingInventory, setPendingInventory] = useState([]);
  const [itemsDropdown, setItemsDropdown] = useState([]);
  const [locationsDropdown, setLocationsDropdown] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);

  const totalPending = pendingItems.length + pendingLocations.length + pendingInventory.length;

  const [itemData, setItemData] = useState({
    name: "",
    description: "",
    category: "",
    unit: "",
    user: { id: user?.id }
  });

  const [locationData, setLocationData] = useState({
    locationName: "",
    address: "",
    user: { id: user?.id }
  });

  const [inventoryData, setInventoryData] = useState({
    item: { id: "" },
    location: { id: "" },
    stock: "",
    minimumStock: "",
    user: { id: user?.id }
  });

  useEffect(() => {
    if (!user || !user.id) return;
    fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      // Ensure context has fresh data
      await fetchStats();

      // Use context helpers to derive user-specific data
      const fetchedItems = getItemsByUser(user.id) || [];
      const fetchedLocations = getLocationsByUser(user.id) || [];
      const fetchedInventory = getInventoryByUser(user.id) || [];

      setItems(fetchedItems);
      setPendingItems([]);

      setLocations(fetchedLocations);
      setPendingLocations([]);

      // Normalize inventory fields (support APIs that use `quantity`)
      const normalizeRecord = (r) => ({
        ...r,
        stock: r.stock ?? r.quantity ?? r.qty ?? 0,
        minimumStock: r.minimumStock ?? r.minimum_stock ?? r.minStock ?? 0,
      });

      setInventory(fetchedInventory.map(normalizeRecord));
    } catch (error) {
      console.error("Unable to load user inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update dropdown lists whenever context data changes
  useEffect(() => {
    setItemsDropdown(ctxItems || []);
  }, [ctxItems]);

  useEffect(() => {
    setLocationsDropdown(ctxLocations || []);
  }, [ctxLocations]);

  const handleItemChange = (e) => {
    setItemData({ ...itemData, [e.target.name]: e.target.value });
  };

  const handleLocationChange = (e) => {
    setLocationData({ ...locationData, [e.target.name]: e.target.value });
  };

  const handleInventoryChange = (e) => {
    const { name, value } = e.target;

    if (name === "itemId") {
      setInventoryData({ ...inventoryData, item: { id: value } });
      return;
    }

    if (name === "locationId") {
      setInventoryData({ ...inventoryData, location: { id: value } });
      return;
    }

    setInventoryData({ ...inventoryData, [name]: value });
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!itemData.name || !itemData.category) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      // Use context helper to add item
      addItem({ ...itemData, status: "PENDING" }, user?.id);
      setItemData({ name: "", description: "", category: "", unit: "", user: { id: user?.id } });
      await fetchUserData();
      await fetchStats();
    } catch (error) {
      alert("Error adding item: " + (error?.message || error));
    }
  };

  const handleAddLocation = async (e) => {
    e.preventDefault();
    if (!locationData.locationName || !locationData.address) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      addLocation({ ...locationData, status: "PENDING" }, user?.id);
      setLocationData({ locationName: "", address: "", user: { id: user?.id } });
      await fetchUserData();
      await fetchStats();
    } catch (error) {
      alert("Error adding location: " + (error?.message || error));
    }
  };

  const handleAddInventory = async (e) => {
    e.preventDefault();
    if (!inventoryData.item.id || !inventoryData.location.id || !inventoryData.stock) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      addInventory({
        item: { id: Number(inventoryData.item.id) },
        location: { id: Number(inventoryData.location.id) },
        stock: Number(inventoryData.stock),
        minimumStock: Number(inventoryData.minimumStock || 0),
        status: "PENDING",
      }, user?.id);

      setInventoryData({ item: { id: "" }, location: { id: "" }, stock: "", minimumStock: "", user: { id: user?.id } });
      fetchUserData();
    } catch (error) {
      alert("Error adding stock: " + (error?.message || error));
    }
  };

  const lowStockRecords = inventory.filter(
    (record) => Number(record.stock) <= Number(record.minimumStock)
  );

  const totalStockValue = inventory.reduce((sum, record) => sum + Number(record.stock), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      {/* Header with User Profile */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900/95 to-slate-900/75 border border-slate-800 shadow-2xl p-8 mb-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-700 text-slate-950 flex items-center justify-center text-4xl font-bold shadow-lg">
              {user.fullName?.charAt(0) || "U"}
            </div>
            <div>
              <h1 className="text-4xl font-bold">Welcome back, {user.fullName}</h1>
              <p className="text-slate-400 mt-2">{totalPending > 0 ? `You have ${totalPending} pending review ${totalPending === 1 ? 'submission' : 'submissions'} waiting admin approval.` : "Manage your inventory with precision and efficiency."}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-2xl bg-slate-800/90 p-4 border border-slate-700 hover:border-cyan-400 transition">
              <p className="text-xs uppercase text-slate-400">Items</p>
              <p className="text-3xl font-semibold text-cyan-300 mt-2">{items.length}</p>
            </div>
            <div className="rounded-2xl bg-slate-800/90 p-4 border border-slate-700 hover:border-emerald-400 transition">
              <p className="text-xs uppercase text-slate-400">Locations</p>
              <p className="text-3xl font-semibold text-emerald-300 mt-2">{locations.length}</p>
            </div>
            <div className="rounded-2xl bg-slate-800/90 p-4 border border-slate-700 hover:border-rose-400 transition">
              <p className="text-xs uppercase text-slate-400">Low Stock</p>
              <p className="text-3xl font-semibold text-rose-300 mt-2">{lowStockRecords.length}</p>
            </div>
            <div className="rounded-2xl bg-slate-800/90 p-4 border border-slate-700 hover:border-amber-400 transition">
              <p className="text-xs uppercase text-slate-400">Total Stock</p>
              <p className="text-3xl font-semibold text-amber-300 mt-2">{totalStockValue}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="rounded-3xl bg-slate-900/95 border border-slate-800 p-6 shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                className={`w-full rounded-2xl px-4 py-3 text-left font-semibold transition ${activeTab === "overview" ? "bg-cyan-500 text-slate-950" : "bg-slate-800 text-slate-200 hover:bg-slate-700"}`}
                onClick={() => setActiveTab("overview")}
              >
                📊 Overview
              </button>
              <button
                className={`w-full rounded-2xl px-4 py-3 text-left font-semibold transition ${activeTab === "items" ? "bg-cyan-500 text-slate-950" : "bg-slate-800 text-slate-200 hover:bg-slate-700"}`}
                onClick={() => setActiveTab("items")}
              >
                ➕ Add Item
              </button>
              <button
                className={`w-full rounded-2xl px-4 py-3 text-left font-semibold transition ${activeTab === "locations" ? "bg-cyan-500 text-slate-950" : "bg-slate-800 text-slate-200 hover:bg-slate-700"}`}
                onClick={() => setActiveTab("locations")}
              >
                📍 Add Location
              </button>
              <button
                className={`w-full rounded-2xl px-4 py-3 text-left font-semibold transition ${activeTab === "stocks" ? "bg-cyan-500 text-slate-950" : "bg-slate-800 text-slate-200 hover:bg-slate-700"}`}
                onClick={() => setActiveTab("stocks")}
              >
                📦 Add Stock
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900/95 border border-slate-800 p-6 shadow-xl">
            <h2 className="text-2xl font-bold mb-4">⚠️ Low Stock Alerts</h2>
            {lowStockRecords.length > 0 ? (
              <div className="space-y-3">
                {lowStockRecords.slice(0, 4).map((record) => (
                  <div key={record.id} className="rounded-2xl bg-slate-800 p-4 border border-rose-700/30 hover:border-rose-500/60 transition">
                    <p className="font-semibold text-slate-100">{record.item?.name || "Unknown item"}</p>
                    <p className="text-sm text-slate-400">{record.location?.locationName || "Unknown location"}</p>
                    <p className="mt-2 text-sm text-rose-300 font-medium">📉 Stock: {record.stock} / Min: {record.minimumStock}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-4">✅ All stock levels are healthy!</p>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <section className="space-y-8">
          {activeTab === "overview" && (
            <div className="rounded-3xl bg-slate-900/95 border border-slate-800 p-8 shadow-xl">
              <h2 className="text-3xl font-bold mb-6">📈 Inventory Overview</h2>
              <div className="grid gap-6 lg:grid-cols-4 mb-8">
                <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 border border-slate-700">
                  <p className="text-sm uppercase text-slate-400 font-semibold">Total Items</p>
                  <p className="text-4xl font-bold text-cyan-300 mt-3">{items.length}</p>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 border border-slate-700">
                  <p className="text-sm uppercase text-slate-400 font-semibold">Locations</p>
                  <p className="text-4xl font-bold text-emerald-300 mt-3">{locations.length}</p>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 border border-slate-700">
                  <p className="text-sm uppercase text-slate-400 font-semibold">Records</p>
                  <p className="text-4xl font-bold text-violet-300 mt-3">{inventory.length}</p>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 border border-slate-700">
                  <p className="text-sm uppercase text-slate-400 font-semibold">Low Stock</p>
                  <p className="text-4xl font-bold text-rose-300 mt-3">{lowStockRecords.length}</p>
                </div>
              </div>

              <div className="mt-10">
                <h3 className="text-2xl font-bold mb-4">📋 Inventory Details</h3>
                <div className="overflow-hidden rounded-3xl border border-slate-800">
                  <table className="w-full min-w-[640px] bg-slate-950 text-left">
                    <thead className="bg-slate-900/95">
                      <tr>
                        <th className="p-4 text-slate-400 uppercase tracking-wide text-xs font-semibold">Item</th>
                        <th className="p-4 text-slate-400 uppercase tracking-wide text-xs font-semibold">Location</th>
                        <th className="p-4 text-slate-400 uppercase tracking-wide text-xs font-semibold">Stock</th>
                        <th className="p-4 text-slate-400 uppercase tracking-wide text-xs font-semibold">Minimum</th>
                        <th className="p-4 text-slate-400 uppercase tracking-wide text-xs font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="5" className="p-4 text-center text-slate-400">Loading...</td>
                        </tr>
                      ) : inventory.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="p-4 text-center text-slate-400">No inventory records yet</td>
                        </tr>
                      ) : (
                        inventory.map((inv) => (
                          <tr key={inv.id} className="border-t border-slate-800 hover:bg-slate-900/80 transition">
                            <td className="p-4 font-semibold">{inv.item?.name || "—"}</td>
                            <td className="p-4">{inv.location?.locationName || "—"}</td>
                            <td className="p-4 font-semibold text-cyan-300">{inv.stock}</td>
                            <td className="p-4 text-slate-400">{inv.minimumStock}</td>
                            <td className="p-4">
                              {Number(inv.stock) <= Number(inv.minimumStock) ? (
                                <span className="inline-block px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold">Low</span>
                              ) : (
                                <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">OK</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "items" && (
            <div className="rounded-3xl bg-slate-900/95 border border-slate-800 p-8 shadow-xl">
              <h2 className="text-3xl font-bold mb-6">➕ Add New Item</h2>
              <form className="space-y-6" onSubmit={handleAddItem}>
                <div className="grid gap-6 lg:grid-cols-2">
                  <label className="block text-slate-300">
                    <span className="font-semibold mb-2 block">Item Name *</span>
                    <input
                      name="name"
                      value={itemData.name}
                      onChange={handleItemChange}
                      className="w-full rounded-3xl border border-slate-700 bg-slate-950 p-4 text-slate-100 outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-400/20 transition"
                      placeholder="Enter item name"
                      required
                    />
                  </label>
                  <label className="block text-slate-300">
                    <span className="font-semibold mb-2 block">Category *</span>
                    <input
                      name="category"
                      value={itemData.category}
                      onChange={handleItemChange}
                      className="w-full rounded-3xl border border-slate-700 bg-slate-950 p-4 text-slate-100 outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-400/20 transition"
                      placeholder="e.g. Electronics, Furniture"
                      required
                    />
                  </label>
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                  <label className="block text-slate-300">
                    <span className="font-semibold mb-2 block">Unit</span>
                    <input
                      name="unit"
                      value={itemData.unit}
                      onChange={handleItemChange}
                      className="w-full rounded-3xl border border-slate-700 bg-slate-950 p-4 text-slate-100 outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-400/20 transition"
                      placeholder="e.g. pcs, kg, m, liters"
                    />
                  </label>
                </div>
                <label className="block text-slate-300">
                  <span className="font-semibold mb-2 block">Description</span>
                  <textarea
                    name="description"
                    value={itemData.description}
                    onChange={handleItemChange}
                    className="w-full rounded-3xl border border-slate-700 bg-slate-950 p-4 text-slate-100 outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-400/20 transition"
                    placeholder="Add item description..."
                    rows="4"
                  />
                </label>
                <button type="submit" className="rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600 px-8 py-4 font-semibold text-slate-950 transition hover:from-cyan-400 hover:to-cyan-500 hover:shadow-lg hover:shadow-cyan-400/30">
                  💾 Save Item
                </button>
              </form>
            </div>
          )}

          {activeTab === "locations" && (
            <div className="rounded-3xl bg-slate-900/95 border border-slate-800 p-8 shadow-xl">
              <h2 className="text-3xl font-bold mb-6">📍 Add New Location</h2>
              <form className="space-y-6" onSubmit={handleAddLocation}>
                <div className="grid gap-6 lg:grid-cols-2">
                  <label className="block text-slate-300">
                    <span className="font-semibold mb-2 block">Location Name *</span>
                    <input
                      name="locationName"
                      value={locationData.locationName}
                      onChange={handleLocationChange}
                      className="w-full rounded-3xl border border-slate-700 bg-slate-950 p-4 text-slate-100 outline-none focus:border-emerald-400 focus:shadow-lg focus:shadow-emerald-400/20 transition"
                      placeholder="e.g. Warehouse A, Office Storage"
                      required
                    />
                  </label>
                  <label className="block text-slate-300">
                    <span className="font-semibold mb-2 block">Address *</span>
                    <input
                      name="address"
                      value={locationData.address}
                      onChange={handleLocationChange}
                      className="w-full rounded-3xl border border-slate-700 bg-slate-950 p-4 text-slate-100 outline-none focus:border-emerald-400 focus:shadow-lg focus:shadow-emerald-400/20 transition"
                      placeholder="Street, city or area"
                      required
                    />
                  </label>
                </div>
                <button type="submit" className="rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-4 font-semibold text-slate-950 transition hover:from-emerald-400 hover:to-emerald-500 hover:shadow-lg hover:shadow-emerald-400/30">
                  💾 Save Location
                </button>
              </form>
            </div>
          )}

          {activeTab === "stocks" && (
            <div className="rounded-3xl bg-slate-900/95 border border-slate-800 p-8 shadow-xl">
              <h2 className="text-3xl font-bold mb-6">📦 Add New Stock Record</h2>
              <form className="space-y-6" onSubmit={handleAddInventory}>
                <div className="grid gap-6 lg:grid-cols-2">
                  <label className="block text-slate-300">
                    <span className="font-semibold mb-2 block">Select Item *</span>
                    <select
                      name="itemId"
                      value={inventoryData.item.id}
                      onChange={handleInventoryChange}
                      className="w-full rounded-3xl border border-slate-700 bg-slate-950 p-4 text-slate-100 outline-none focus:border-rose-400 focus:shadow-lg focus:shadow-rose-400/20 transition"
                      required
                    >
                      <option value="">Choose an item...</option>
                      {itemsDropdown.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-slate-300">
                    <span className="font-semibold mb-2 block">Select Location *</span>
                    <select
                      name="locationId"
                      value={inventoryData.location.id}
                      onChange={handleInventoryChange}
                      className="w-full rounded-3xl border border-slate-700 bg-slate-950 p-4 text-slate-100 outline-none focus:border-rose-400 focus:shadow-lg focus:shadow-rose-400/20 transition"
                      required
                    >
                      <option value="">Choose a location...</option>
                      {locationsDropdown.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.locationName || location.name || "Location"}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                  <label className="block text-slate-300">
                    <span className="font-semibold mb-2 block">Stock Quantity *</span>
                    <input
                      type="number"
                      name="stock"
                      value={inventoryData.stock}
                      onChange={handleInventoryChange}
                      className="w-full rounded-3xl border border-slate-700 bg-slate-950 p-4 text-slate-100 outline-none focus:border-rose-400 focus:shadow-lg focus:shadow-rose-400/20 transition"
                      placeholder="Enter stock amount"
                      min="0"
                      required
                    />
                  </label>
                  <label className="block text-slate-300">
                    <span className="font-semibold mb-2 block">Minimum Stock Alert</span>
                    <input
                      type="number"
                      name="minimumStock"
                      value={inventoryData.minimumStock}
                      onChange={handleInventoryChange}
                      className="w-full rounded-3xl border border-slate-700 bg-slate-950 p-4 text-slate-100 outline-none focus:border-rose-400 focus:shadow-lg focus:shadow-rose-400/20 transition"
                      placeholder="Alert when stock drops below"
                      min="0"
                    />
                  </label>
                </div>
                <button type="submit" className="rounded-full bg-gradient-to-r from-rose-500 to-rose-600 px-8 py-4 font-semibold text-slate-950 transition hover:from-rose-400 hover:to-rose-500 hover:shadow-lg hover:shadow-rose-400/30">
                  💾 Save Stock Record
                </button>
              </form>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default UserDashboard;
