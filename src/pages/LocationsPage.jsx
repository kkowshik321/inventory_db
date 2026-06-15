import { useContext } from "react";
import { InventoryContext } from "../context/InventoryContext";

function LocationsPage() {
  const { locations } = useContext(InventoryContext);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Locations</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {locations.length > 0 ? (
          locations.map((location) => (
            <div key={location.id} className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold">{location.name}</h2>
              <p className="text-gray-600 mt-2">Managed by {location.manager}</p>
              <span className="inline-block mt-4 px-3 py-1 rounded-full bg-green-100 text-green-800">
                {location.capacity}
              </span>
            </div>
          ))
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-lg text-gray-500">
            No locations added yet. Use the dashboard to create storage locations.
          </div>
        )}
      </div>
    </div>
  );
}

export default LocationsPage;
