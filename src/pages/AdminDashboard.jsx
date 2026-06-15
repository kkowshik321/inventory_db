import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import InventoryAPI from "../api/inventoryApi";

function Sparkline({ data = [] }) {
  const points = data.map((v, i) => `${(i / (data.length - 1 || 1)) * 100},${100 - v}`).join(" ");
  return (
    <svg className="w-full h-16" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline fill="none" stroke="#2563EB" strokeWidth="2" points={points} />
    </svg>
  );
}

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingButtons, setLoadingButtons] = useState({});
  const [reviewLoading, setReviewLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "", visible: false });

  const pendingItems = items;
  const pendingLocations = locations;
  const pendingInventory = inventory;

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersRes, itemsRes, locationsRes, inventoryRes] = await Promise.all([
        InventoryAPI.get("/users/"),
        InventoryAPI.get("/requests/items/pending"),
        InventoryAPI.get("/requests/locations/pending"),
        InventoryAPI.get("/requests/inventory/pending")
      ]);
      setUsers(usersRes.data || []);
      setItems(itemsRes.data || []);
      setLocations(locationsRes.data || []);
      setInventory(inventoryRes.data || []);
    } catch (e) {
      console.error("Dashboard Error:", e);
      setError("Unable to load admin data. Check your API endpoints or backend service.");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text, visible: true });
    setTimeout(() => {
      setMessage({ type: "", text: "", visible: false });
    }, 4000);
  };

  const patchReviewStatus = async (type, id, status) => {
    const buttonKey = `${type}-${id}-${status}`;
    try {
      setReviewLoading(true);
      setLoadingButtons(prev => ({ ...prev, [buttonKey]: true }));
      const action = status === "APPROVED" ? "approve" : "reject";
      const endpoint = `/requests/${type}/${id}/${action}`;
      
      await InventoryAPI.patch(endpoint);
      
      showMessage("success", `${type} ${action === "approve" ? "approved" : "rejected"} successfully!`);
      
      setTimeout(() => {
        fetchData();
      }, 500);
    } catch (e) {
      console.error("Review update failed:", e);
      const errorMsg = e?.response?.data?.message || e?.message || "Failed to update request. Please try again.";
      showMessage("error", errorMsg);
    } finally {
      setReviewLoading(false);
      setLoadingButtons(prev => ({ ...prev, [buttonKey]: false }));
    }
  };

  const recentActivity = inventory.slice(-8).reverse();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />

      <main className="ml-64 p-8">
        <section className="rounded-[32px] border border-slate-800/80 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/40 mb-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-300/80">Admin dashboard</p>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-white">Control center for inventory operations</h1>
              <p className="mt-3 text-slate-400">Review pending submissions, manage users, and monitor stock trends from one elegant, enterprise-grade dashboard.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:w-[420px]">
              <div className="rounded-3xl border border-slate-800/80 bg-slate-950/90 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Users</p>
                <p className="mt-4 text-4xl font-semibold text-cyan-300">{loading ? "—" : users.length}</p>
              </div>
              <div className="rounded-3xl border border-slate-800/80 bg-slate-950/90 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Items</p>
                <p className="mt-4 text-4xl font-semibold text-emerald-300">{loading ? "—" : items.length}</p>
              </div>
              <div className="rounded-3xl border border-slate-800/80 bg-slate-950/90 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Locations</p>
                <p className="mt-4 text-4xl font-semibold text-violet-300">{loading ? "—" : locations.length}</p>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-3xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>
        )}

        {message.visible && (
          <div className={`mb-6 rounded-3xl border p-4 text-sm font-semibold transition-all ${
            message.type === "success"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
              : "border-rose-500/40 bg-rose-500/10 text-rose-200"
          }`}>
            {message.type === "success" ? "✅ " : "❌ "}
            {message.text}
          </div>
        )}

        <section className="grid gap-6 lg:grid-cols-[1.8fr_1fr] mb-8">
          <div className="space-y-6">
            <div className="rounded-[28px] border border-slate-800/80 bg-slate-900/95 p-6 shadow-xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-white">Review Queue</h2>
                  <p className="mt-1 text-slate-400">Approve or reject new submissions before they go live.</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-300">{reviewLoading ? "Updating..." : "Live review mode"}</span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-slate-800/80 bg-slate-950/95 p-5">
                  <p className="text-sm text-slate-400">Pending items</p>
                  <p className="mt-3 text-3xl font-semibold text-cyan-300">{pendingItems.length}</p>
                </div>
                <div className="rounded-3xl border border-slate-800/80 bg-slate-950/95 p-5">
                  <p className="text-sm text-slate-400">Pending locations</p>
                  <p className="mt-3 text-3xl font-semibold text-violet-300">{pendingLocations.length}</p>
                </div>
                <div className="rounded-3xl border border-slate-800/80 bg-slate-950/95 p-5">
                  <p className="text-sm text-slate-400">Pending stocks</p>
                  <p className="mt-3 text-3xl font-semibold text-amber-300">{pendingInventory.length}</p>
                </div>
              </div>

              <div className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
                <div className="rounded-[28px] border border-slate-800/80 bg-slate-950/95 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Items Pending Review</h3>
                    <span className="text-sm text-slate-500">{pendingItems.length} requests</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="border-b border-slate-800 text-slate-500">
                        <tr>
                          <th className="py-3">Name</th>
                          <th className="py-3">Category</th>
                          <th className="py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingItems.length === 0 ? (
                          <tr>
                            <td colSpan="3" className="py-4 text-center text-slate-500">No pending item approvals</td>
                          </tr>
                        ) : pendingItems.map(item => (
                          <tr key={item.id} className="border-b border-slate-800 hover:bg-slate-900/80 transition">
                            <td className="py-3">{item.name}</td>
                            <td className="py-3 text-slate-400">{item.category}</td>
                            <td className="py-3 flex flex-wrap gap-2">
                              <button disabled={loadingButtons[`items-${item.id}-APPROVED`]} onClick={() => patchReviewStatus('items', item.id, 'APPROVED')} className="rounded-full bg-emerald-500 px-3 py-1 text-white text-xs enabled:hover:bg-emerald-600 enabled:cursor-pointer disabled:opacity-50">{loadingButtons[`items-${item.id}-APPROVED`] ? "..." : "Approve"}</button>
                              <button disabled={loadingButtons[`items-${item.id}-REJECTED`]} onClick={() => patchReviewStatus('items', item.id, 'REJECTED')} className="rounded-full bg-rose-500 px-3 py-1 text-white text-xs enabled:hover:bg-rose-600 enabled:cursor-pointer disabled:opacity-50">{loadingButtons[`items-${item.id}-REJECTED`] ? "..." : "Reject"}</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-[28px] border border-slate-800/80 bg-slate-950/95 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Location Requests</h3>
                      <span className="text-sm text-slate-500">{pendingLocations.length}</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-slate-300">
                        <thead className="border-b border-slate-800 text-slate-500">
                          <tr>
                            <th className="py-3">Location</th>
                            <th className="py-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendingLocations.length === 0 ? (
                            <tr>
                              <td colSpan="2" className="py-4 text-center text-slate-500">No pending locations</td>
                            </tr>
                          ) : pendingLocations.map(location => (
                            <tr key={location.id} className="border-b border-slate-800 hover:bg-slate-900/80 transition">
                              <td className="py-3">{location.locationName}</td>
                              <td className="py-3 flex flex-wrap gap-2">
                                <button disabled={loadingButtons[`locations-${location.id}-APPROVED`]} onClick={() => patchReviewStatus('locations', location.id, 'APPROVED')} className="rounded-full bg-emerald-500 px-3 py-1 text-white text-xs enabled:hover:bg-emerald-600 enabled:cursor-pointer disabled:opacity-50">{loadingButtons[`locations-${location.id}-APPROVED`] ? "..." : "Approve"}</button>
                                <button disabled={loadingButtons[`locations-${location.id}-REJECTED`]} onClick={() => patchReviewStatus('locations', location.id, 'REJECTED')} className="rounded-full bg-rose-500 px-3 py-1 text-white text-xs enabled:hover:bg-rose-600 enabled:cursor-pointer disabled:opacity-50">{loadingButtons[`locations-${location.id}-REJECTED`] ? "..." : "Reject"}</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-slate-800/80 bg-slate-950/95 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Stock Requests</h3>
                      <span className="text-sm text-slate-500">{pendingInventory.length}</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-slate-300">
                        <thead className="border-b border-slate-800 text-slate-500">
                          <tr>
                            <th className="py-3">Item</th>
                            <th className="py-3">Qty</th>
                            <th className="py-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendingInventory.length === 0 ? (
                            <tr>
                              <td colSpan="3" className="py-4 text-center text-slate-500">No pending stock requests</td>
                            </tr>
                          ) : pendingInventory.map(record => (
                            <tr key={record.id} className="border-b border-slate-800 hover:bg-slate-900/80 transition">
                              <td className="py-3">{record.item?.name}</td>
                              <td className="py-3 text-slate-400">{record.stock}</td>
                              <td className="py-3 flex flex-wrap gap-2">
                                <button disabled={loadingButtons[`inventory-${record.id}-APPROVED`]} onClick={() => patchReviewStatus('inventory', record.id, 'APPROVED')} className="rounded-full bg-emerald-500 px-3 py-1 text-white text-xs enabled:hover:bg-emerald-600 enabled:cursor-pointer disabled:opacity-50">{loadingButtons[`inventory-${record.id}-APPROVED`] ? "..." : "Approve"}</button>
                                <button disabled={loadingButtons[`inventory-${record.id}-REJECTED`]} onClick={() => patchReviewStatus('inventory', record.id, 'REJECTED')} className="rounded-full bg-rose-500 px-3 py-1 text-white text-xs enabled:hover:bg-rose-600 enabled:cursor-pointer disabled:opacity-50">{loadingButtons[`inventory-${record.id}-REJECTED`] ? "..." : "Reject"}</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[28px] border border-slate-800/80 bg-slate-900/95 p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Users</h3>
                  <p className="text-sm text-slate-400">Browse accounts and inspect profiles.</p>
                </div>
                <span className="text-sm text-slate-500">{users.length}</span>
              </div>

              <div className="mt-5 space-y-3 max-h-[52vh] overflow-auto">
                {users.filter(u => u.fullName?.toLowerCase().includes(query.toLowerCase()) || u.email?.toLowerCase().includes(query.toLowerCase())).map(u => (
                  <button key={u.id} onClick={() => setSelectedUser(u)} className={`w-full rounded-3xl border p-4 text-left transition ${selectedUser?.id === u.id ? 'border-cyan-400 bg-slate-800 text-white' : 'border-slate-800/70 bg-slate-950/90 text-slate-300 hover:border-cyan-400 hover:bg-slate-900'}`}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-600 text-base font-semibold text-slate-950">{u.fullName?.charAt(0)}</div>
                      <div className="flex-1">
                        <div className="font-semibold">{u.fullName}</div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                      </div>
                      <div className="text-xs text-slate-400">{u.role?.roleName || 'User'}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-800/80 bg-slate-900/95 p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-white">Activity Snapshot</h3>
              <div className="mt-5 space-y-4">
                {inventory.slice().reverse().slice(0, 4).map((record) => (
                  <div key={record.id} className="rounded-3xl border border-slate-800/80 bg-slate-950/90 p-4">
                    <p className="text-sm text-slate-400">{record.item?.name || 'Unknown item'}</p>
                    <p className="mt-2 text-sm text-slate-300">{record.user?.fullName || record.user?.email || 'Unknown user'}</p>
                    <p className="mt-2 text-xs text-slate-500">{new Date(record.updatedAt || record.createdAt || Date.now()).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-slate-800/80 bg-slate-900/95 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Inventory Analytics</h3>
              <span className="text-sm text-slate-500">Last 30 days</span>
            </div>
            <Sparkline data={[20, 28, 45, 37, 58, 68, 62, 81, 74, 90, 84]} />
          </div>

          <div className="rounded-[28px] border border-slate-800/80 bg-slate-900/95 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Latest Activity</h3>
            <div className="space-y-3">
              {inventory.slice().reverse().slice(0, 6).map((inv) => (
                <div key={inv.id} className="rounded-3xl border border-slate-800/80 bg-slate-950/90 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-100">{inv.item?.name || 'Item'}</p>
                      <p className="text-sm text-slate-500">{inv.location?.locationName || 'Location'}</p>
                    </div>
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">{inv.stock}</span>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">{inv.user?.fullName || inv.user?.email || 'Unknown user'}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
