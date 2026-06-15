import { useContext, useEffect, useState } from "react";
import API from "../api/inventoryApi";
import SearchBar from "./SearchBar";
import { InventoryContext } from "../context/InventoryContext";

function InventoryTable() {
  const { items, locations, inventory } = useContext(InventoryContext);
  const [search, setSearch] = useState("");
  const [remoteItems, setRemoteItems] = useState([]);

  useEffect(() => {
    if (inventory.length === 0) {
      fetchItems();
    }
  }, [inventory.length]);

  const fetchItems = async () => {
    try {
      const response = await API.get("/inventory");
      setRemoteItems(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const displayItems =
    inventory.length > 0
      ? inventory.map((record) => {
          const item = items.find((i) => i.id === record.itemId) || {};
          const location = locations.find((loc) => loc.id === record.locationId) || {};
          return {
            id: record.id,
            name: item.name || "Unknown Item",
            description: item.description || "",
            stock: record.stock,
            location: location.name || "Unknown Location",
            status: record.stock < 10 ? "Low Stock" : "Available",
          };
        })
      : remoteItems;

  const filteredItems = displayItems.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Inventory Items</h2>
      </div>

      <SearchBar search={search} setSearch={setSearch} />

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-3 text-left">Item</th>
            <th className="p-3 text-left">Description</th>
            <th className="p-3 text-left">Stock</th>
            <th className="p-3 text-left">Location</th>
            <th className="p-3 text-left">Status</th>
          </tr>
        </thead>

        <tbody>
          {filteredItems.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="p-3">{item.name}</td>
              <td className="p-3">{item.description}</td>
              <td className="p-3">{item.stock}</td>
              <td className="p-3">{item.location}</td>

              <td className="p-3">
                <span
                  className={`px-3 py-1 rounded-full ${
                    item.status === "Low Stock"
                      ? "bg-red-200 text-red-700"
                      : "bg-green-200 text-green-700"
                  }`}
                >
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default InventoryTable;
