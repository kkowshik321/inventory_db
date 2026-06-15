from pathlib import Path

user_dashboard_path = Path(r"c:\Users\User\Desktop\SEM 1-3\DBMS-P\Project_Frontend\Inventory_Dashboard\src\pages\UserDashboard.jsx")
admin_dashboard_path = Path(r"c:\Users\User\Desktop\SEM 1-3\DBMS-P\Project_Frontend\Inventory_Dashboard\src\pages\AdminDashboard.jsx")

user_dashboard_content = '''import { useEffect, useState } from "react";
import InventoryAPI from "../api/inventoryApi";

function UserDashboard() {
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");

  const [itemData, setItemData] = useState({
    name: "",
    description: "",
    category: "",
    unit: "",
    user: { id: user.id }
  });

  const [locationData, setLocationData] = useState({
    locationName: "",
    address: "",
    user: { id: user.id }
  });

  const [inventoryData, setInventoryData] = useState({
    item: { id: "" },
    location: { id: "" },
    stock: "",
    minimumStock: "",
    user: { id: user.id }
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const itemsRes = await InventoryAPI.get(`/items/user/${user.id}`);
      const locationsRes = await InventoryAPI.get(`/locations/user/${user.id}`);
      const inventoryRes = await InventoryAPI.get(`/inventory/user/${user.id}`);

      setItems(itemsRes.data);
      setLocations(locationsRes.data);
      setInventory(inventoryRes.data);
    } catch (error) {
      console.error("Unable to load user inventory:", error);
    }
  };

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
      return;
    }

    await InventoryAPI.post("/items/", itemData);
    setItemData({ name: "", description: "", category: "", unit: "", user: { id: user.id } });
    fetchUserData();
  };

  const handleAddLocation = async (e) => {
    e.preventDefault();
    if (!locationData.locationName || !locationData.address) {
      return;
    }

    await InventoryAPI.post("/locations/", locationData);
    setLocationData({ locationName: "", address: "", user: { id: user.id } });
    fetchUserData();
  };

  const handleAddInventory = async (e) => {
    e.preventDefault();
    if (!inventoryData.item.id || !inventoryData.location.id || !inventoryData.stock) {
      return;
    }

    await InventoryAPI.post("/inventory/", {
      item: { id: Number(inventoryData.item.id) },
      location: { id: Number(inventoryData.location.id) },
      stock: Number(inventoryData.stock),
      minimumStock: Number(inventoryData.minimumStock),
      user: { id: user.id }
    });

    setInventoryData({ item: { id: "" }, location: { id: "" }, stock: "", minimumStock: "", user: { id: user.id } });
    fetchUserData();
  };

  const lowStockRecords = inventory.filter(
    (record) => Number(record.stock) <= Number(record.minimumStock)
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="rounded-3xl bg-slate-900/95 border border-slate-800 shadow-2xl p-8 mb-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-700 text-slate-950 flex items-center justify-center text-4xl font-bold shadow-lg">
              {user.fullName?.charAt(0) || "U"}
            </div>
            <div>
              <h1 className="text-4xl font-bold">Welcome back, {user.fullName}</h1>
              <p className="text-slate-400 mt-2">Manage your items, locations, and stock records with a clear, fast workflow.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-slate-800/90 p-5 border border-slate-700">
              <p className="text-sm uppercase text-slate-400">Items</p>
              <p className="text-4xl font-semibold text-cyan-300 mt-3">{items.length}</p>
            </div>
            <div className="rounded-3xl bg-slate-800/90 p-5 border border-slate-700">
              <p className="text-sm uppercase text-slate-400">Locations</p>
              <p className="text-4xl font-semibold text-emerald-300 mt-3">{locations.length}</p>
            </div>
            <div className="rounded-3xl bg-slate-800/90 p-5 border border-slate-700">
              <p className="text-sm uppercase text-slate-400">Low Stock</p>
              <p className="text-4xl font-semibold text-rose-300 mt-3">{lowStockRecords.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-3xl bg-slate-900/95 border border-slate-800 p-6 shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                className={`w-full rounded-2xl px-4 py-3 text-left font-semibold transition ${activeTab === "overview" ? "bg-cyan-500 text-slate-950" : "bg-slate-800 text-slate-200 hover:bg-slate-700"}`}
                onClick={() => setActiveTab("overview")}
              >
                Overview
              </button>
              <button
                className={`w-full rounded-2xl px-4 py-3 text-left font-semibold transition ${activeTab === "items" ? "bg-cyan-500 text-slate-950" : "bg-slate-800 text-slate-200 hover:bg-slate-700"}`}
                onClick={() => setActiveTab("items")}
              >
                Add Item
              </button>
              <button
                className={`w-full rounded-2xl px-4 py-3 text-left font-semibold transition ${activeTab === "locations" ? "bg-cyan-500 text-slate-950" : "bg-slate-800 text-slate-200 hover:bg-slate-700"}`}
                onClick={() => setActiveTab("locations")}
              >
                Add Location
              </button>
              <button
                className={`w-full rounded-2xl px-4 py-3 text-left font-semibold transition ${activeTab === "stocks" ? "bg-cyan-500 text-slate-950" : "bg-slate-800 text-slate-200 hover:bg-slate-700"}`}
                onClick={() => setActiveTab("stocks")}
              >
                Add Stock
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900/95 border border-slate-800 p-6 shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Low Stock Alerts</h2>
            {lowStockRecords.length > 0 ? (
              <div className="space-y-3">
                {lowStockRecords.slice(0, 4).map((record) => (
                  <div key={record.id} className="rounded-2xl bg-slate-800 p-4 border border-rose-700/30">
                    <p className="font-semibold">{record.item?.name || "Unknown item"}</p>
                    <p className="text-sm text-slate-400">{record.location?.locationName || "Unknown location"}</p>
                    <p className="mt-2 text-sm text-rose-300">Stock: {record.stock} / Min: {record.minimumStock}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">All stock levels are healthy.</p>
            )}
          </div>
        </aside>

        <section className="space-y-8">
          {activeTab === "overview" && (
            <div className="rounded-3xl bg-slate-900/95 border border-slate-800 p-8 shadow-xl">
              <h2 className="text-3xl font-bold mb-6">Overview</h2>
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-3xl bg-slate-800 p-6 border border-slate-700">
                  <p className="text-sm uppercase text-slate-400">Owned Items</p>
                  <p className="text-4xl font-semibold text-cyan-300 mt-3">{items.length}</p>
                </div>
                <div className="rounded-3xl bg-slate-800 p-6 border border-slate-700">
                  <p className="text-sm uppercase text-slate-400">Owned Locations</p>
                  <p className="text-4xl font-semibold text-emerald-300 mt-3">{locations.length}</p>
                </div>
                <div className="rounded-3xl bg-slate-800 p-6 border border-slate-700">
                  <p className="text-sm uppercase text-slate-400">Stock Records</p>
                  <p className="text-4xl font-semibold text-rose-300 mt-3">{inventory.length}</p>
                </div>
              </div>
              <div className="mt-10">
                <h3 className="text-2xl font-bold mb-4">Inventory Table</h3>
                <div className="overflow-hidden rounded-3xl border border-slate-800">
                  <table className="w-full min-w-[640px] bg-slate-950 text-left">
                    <thead className="bg-slate-900/95">
                      <tr>
                        <th className="p-4 text-slate-400 uppercase tracking-wide text-xs">Item</th>
                        <th className="p-4 text-slate-400 uppercase tracking-wide text-xs">Location</th>
                        <th className="p-4 text-slate-400 uppercase tracking-wide text-xs">Stock</th>
                        <th className="p-4 text-slate-400 uppercase tracking-wide text-xs">Minimum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.map((inv) => (
                        <tr key={inv.id} className="border-t border-slate-800 hover:bg-slate-900/80">
                          <td className="p-4">{inv.item?.name || "—"}</td>
                          <td className="p-4">{inv.location?.locationName || "—"}</td>
                          <td className="p-4 font-semibold text-cyan-300">{inv.stock}</td>
                          <td className="p-4 text-slate-400">{inv.minimumStock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "items" && (
            <div className="rounded-3xl bg-slate-900/95 border border-slate-800 p-8 shadow-xl">
              <h2 className="text-3xl font-bold mb-6">Add New Item</h2>
              <form className="space-y-6" onSubmit={handleAddItem}>
                <div className="grid gap-6 lg:grid-cols-2">
                  <label className="block text-slate-300">
                    Item Name
                    <input
                      name="name"
                      value={itemData.name}
                      onChange={handleItemChange}
                      className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950 p-4 text-slate-100 outline-none focus:border-cyan-400"
                      placeholder="Enter item name"
                      required
                    />
                  </label>
                  <label className="block text-slate-300">
                    Category
                    <input
                      name="category"
                      value={itemData.category}
                      onChange={handleItemChange}
                      className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950 p-4 text-slate-100 outline-none focus:border-cyan-400"
                      placeholder="e.g. Electronics"
                      required
                    />
                  </label>
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                  <label className="block text-slate-300">
                    Unit
                    <input
                      name="unit"
                      value={itemData.unit}
                      onChange={handleItemChange}
                      className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950 p-4 text-slate-100 outline-none focus:border-cyan-400"
                      placeholder="e.g. pcs, kg"
                    />
                  </label>
                  <label className="block text-slate-300 lg:col-span-2">
                    Description
                    <textarea
                      name="description"
                      value={itemData.description}
                      onChange={handleItemChange}
                      className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950 p-4 text-slate-100 outline-none focus:border-cyan-400"
                      placeholder="Item description"
                      rows="4"
                    />
                  </label>
                </div>
                <button type="submit" className="rounded-full bg-cyan-500 px-8 py-4 font-semibold text-slate-950 transition hover:bg-cyan-400">
                  Save Item
                </button>
              </form>
            </div>
          )}

          {activeTab === "locations" && (
            <div className="rounded-3xl bg-slate-900/95 border border-slate-800 p-8 shadow-xl">
              <h2 className="text-3xl font-bold mb-6">Add New Location</h2>
              <form className="space-y-6" onSubmit={handleAddLocation}>
                <div className="grid gap-6 lg:grid-cols-2">
                  <label className="block text-slate-300">
                    Location Name
                    <input
                      name="locationName"
                      value={locationData.locationName}
                      onChange={handleLocationChange}
                      className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950 p-4 text-slate-100 outline-none focus:border-emerald-400"
                      placeholder="e.g. Warehouse A"
                      required
                    />
                  </label>
                  <label className="block text-slate-300">
                    Address
                    <input
                      name="address"
                      value={locationData.address}
                      onChange={handleLocationChange}
                      className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950 p-4 text-slate-100 outline-none focus:border-emerald-400"
                      placeholder="Street, city or area"
                      required
                    />
                  </label>
                </div>
                <button type="submit" className="rounded-full bg-emerald-500 px-8 py-4 font-semibold text-slate-950 transition hover:bg-emerald-400">
                  Save Location
                </button>
              </form>
            </div>
          )}

          {activeTab === "stocks" && (
            <div className="rounded-3xl bg-slate-900/95 border border-slate-800 p-8 shadow-xl">
              <h2 className="text-3xl font-bold mb-6">Add New Stock</h2>
              <form className="space-y-6" onSubmit={handleAddInventory}>
                <div className="grid gap-6 lg:grid-cols-2">
                  <label className="block text-slate-300">
                    Item ID
                    <input
                      type="number"
                      name="itemId"
                      value={inventoryData.item.id}
                      onChange={handleInventoryChange}
                      className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950 p-4 text-slate-100 outline-none focus:border-rose-400"
                      placeholder="Select or type item ID"
                      required
                    />
                  </label>
                  <label className="block text-slate-300">
                    Location ID
                    <input
                      type="number"
                      name="locationId"
                      value={inventoryData.location.id}
                      onChange={handleInventoryChange}
                      className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950 p-4 text-slate-100 outline-none focus:border-rose-400"
                      placeholder="Select or type location ID"
                      required
                    />
                  </label>
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                  <label className="block text-slate-300">
                    Stock Quantity
                    <input
                      type="number"
                      name="stock"
                      value={inventoryData.stock}
                      onChange={handleInventoryChange}
                      className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950 p-4 text-slate-100 outline-none focus:border-rose-400"
                      placeholder="Enter stock amount"
                      required
                    />
                  </label>
                  <label className="block text-slate-300">
                    Minimum Stock
                    <input
                      type="number"
                      name="minimumStock"
                      value={inventoryData.minimumStock}
                      onChange={handleInventoryChange}
                      className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950 p-4 text-slate-100 outline-none focus:border-rose-400"
                      placeholder="Set minimum stock"
                    />
                  </label>
                </div>
                <button type="submit" className="rounded-full bg-rose-500 px-8 py-4 font-semibold text-slate-950 transition hover:bg-rose-400">
                  Save Stock
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
'''

admin_dashboard_content = '''import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import InventoryAPI from "../api/inventoryApi";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const usersRes = await InventoryAPI.get("/users/");
      const itemsRes = await InventoryAPI.get("/items/");
      const locationsRes = await InventoryAPI.get("/locations/");
      const inventoryRes = await InventoryAPI.get("/inventory/");

      setUsers(usersRes.data);
      setItems(itemsRes.data);
      setLocations(locationsRes.data);
      setInventory(inventoryRes.data);
    } catch (err) {
      console.error("Error loading admin data:", err);
    }
  };

  const lowStockAlerts = inventory.filter((record) => Number(record.stock) <= Number(record.minimumStock));

  const selectedUserItems = selectedUser
    ? items.filter((item) => item.user?.id === selectedUser.id)
    : [];
  const selectedUserLocations = selectedUser
    ? locations.filter((location) => location.user?.id === selectedUser.id)
    : [];
  const selectedUserInventory = selectedUser
    ? inventory.filter((inv) => inv.user?.id === selectedUser.id)
    : [];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <main className="ml-72 w-full p-8">
        <div className="mb-10 flex flex-col gap-4">
          <h1 className="text-5xl font-bold">Admin Dashboard</h1>
          <p className="text-slate-400 max-w-3xl">
            Review user activity, inventory health, and low stock alerts from the database.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-5 mb-10">
          <div className="xl:col-span-2 rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl">
            <h2 className="text-xl font-semibold text-slate-300">Users</h2>
            <p className="text-5xl font-bold text-cyan-300 mt-4">{users.length}</p>
          </div>
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl">
            <h2 className="text-xl font-semibold text-slate-300">Items</h2>
            <p className="text-5xl font-bold text-emerald-300 mt-4">{items.length}</p>
          </div>
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl">
            <h2 className="text-xl font-semibold text-slate-300">Locations</h2>
            <p className="text-5xl font-bold text-violet-300 mt-4">{locations.length}</p>
          </div>
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl">
            <h2 className="text-xl font-semibold text-slate-300">Stock Records</h2>
            <p className="text-5xl font-bold text-rose-300 mt-4">{inventory.length}</p>
          </div>
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl">
            <h2 className="text-xl font-semibold text-slate-300">Low Stock</h2>
            <p className="text-5xl font-bold text-amber-300 mt-4">{lowStockAlerts.length}</p>
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[320px_1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
              <h2 className="text-3xl font-bold mb-6">Users</h2>
              <div className="space-y-3">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className="w-full rounded-3xl border border-slate-800 bg-slate-950/70 p-4 text-left transition hover:border-cyan-400"
                  >
                    <p className="font-semibold text-slate-100">{user.fullName}</p>
                    <p className="text-sm text-slate-400">{user.email}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
              <h2 className="text-3xl font-bold mb-4">Low Stock Alerts</h2>
              {lowStockAlerts.length > 0 ? (
                <div className="space-y-3">
                  {lowStockAlerts.slice(0, 5).map((record) => (
                    <div key={record.id} className="rounded-3xl bg-slate-950/80 p-4 border border-amber-500/20">
                      <p className="font-semibold text-slate-100">{record.item?.name || "Unnamed item"}</p>
                      <p className="text-sm text-slate-400">{record.location?.locationName || "Unknown location"}</p>
                      <p className="mt-2 text-sm text-amber-300">{record.stock} / {record.minimumStock} stock</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400">No low stock alerts right now.</p>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-xl">
              {selectedUser ? (
                <>
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-4xl font-bold">
                        {selectedUser.fullName?.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-4xl font-bold">{selectedUser.fullName}</h2>
                        <p className="text-slate-400 mt-2">{selectedUser.email}</p>
                        <p className="mt-2 inline-flex rounded-full bg-slate-950/70 px-4 py-2 text-sm font-semibold text-cyan-300">
                          {selectedUser.role?.roleName || "User"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3 mt-10">
                    <div className="rounded-3xl bg-slate-950/80 p-6 border border-slate-800">
                      <p className="text-slate-400">Items</p>
                      <p className="text-4xl font-bold text-cyan-300 mt-3">{selectedUserItems.length}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-950/80 p-6 border border-slate-800">
                      <p className="text-slate-400">Locations</p>
                      <p className="text-4xl font-bold text-emerald-300 mt-3">{selectedUserLocations.length}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-950/80 p-6 border border-slate-800">
                      <p className="text-slate-400">Stocks</p>
                      <p className="text-4xl font-bold text-rose-300 mt-3">{selectedUserInventory.length}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex h-72 items-center justify-center rounded-3xl bg-slate-950/80 border border-slate-800 text-slate-400">
                  Select a user to inspect their inventory details.
                </div>
              )}
            </div>

            {selectedUser && (
              <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-xl">
                <h2 className="text-3xl font-bold mb-6">Activity Log</h2>
                <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-950/80">
                  <table className="w-full min-w-[680px] text-left text-slate-100">
                    <thead className="bg-slate-900/95">
                      <tr>
                        <th className="p-4 text-slate-400 uppercase text-xs tracking-[0.18em]">Item</th>
                        <th className="p-4 text-slate-400 uppercase text-xs tracking-[0.18em]">Location</th>
                        <th className="p-4 text-slate-400 uppercase text-xs tracking-[0.18em]">Stock</th>
                        <th className="p-4 text-slate-400 uppercase text-xs tracking-[0.18em]">Minimum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedUserInventory.map((inv) => (
                        <tr key={inv.id} className="border-t border-slate-800 hover:bg-slate-900/70">
                          <td className="p-4">{inv.item?.name || "—"}</td>
                          <td className="p-4">{inv.location?.locationName || "—"}</td>
                          <td className="p-4 font-semibold text-cyan-300">{inv.stock}</td>
                          <td className="p-4 text-slate-400">{inv.minimumStock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
'''

user_dashboard_path.write_text(user_dashboard_content, encoding='utf-8')
admin_dashboard_path.write_text(admin_dashboard_content, encoding='utf-8')
print('Wrote UserDashboard and AdminDashboard successfully.')
