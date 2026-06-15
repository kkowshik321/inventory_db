import { useContext } from "react";
import { InventoryContext } from "../context/InventoryContext";

function ItemsPage() {
  const { items } = useContext(InventoryContext);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Items</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold">{item.name}</h2>
              <p className="text-sm text-gray-600">{item.category}</p>
              <p className="mt-2 text-gray-700">{item.description}</p>
              <span className="inline-block mt-4 px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                {item.unit}
              </span>
            </div>
          ))
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-lg text-gray-500">
            No items added yet. Use the dashboard to create inventory items.
          </div>
        )}
      </div>
    </div>
  );
}

export default ItemsPage;
