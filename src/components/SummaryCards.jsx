import { useEffect, useState } from "react";
import { Package, AlertTriangle, Warehouse } from "lucide-react";
import InventoryAPI from "../api/inventoryApi";

function SummaryCards() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStock: 0,
    totalLocations: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const itemsRes = await InventoryAPI.get(`/items/user/${user.id}`);
      const locationsRes = await InventoryAPI.get(`/locations/user/${user.id}`);
      const inventoryRes = await InventoryAPI.get(`/inventory/user/${user.id}`);

      const lowStockCount = inventoryRes.data.filter(
        (record) => Number(record.stock) <= Number(record.minimumStock)
      ).length;

      setStats({
        totalItems: itemsRes.data.length,
        lowStock: lowStockCount,
        totalLocations: locationsRes.data.length
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: "Total Items",
      value: stats.totalItems,
      icon: <Package size={35} />,
      color: "from-blue-600 to-blue-500",
      textColor: "text-blue-100"
    },
    {
      title: "Low Stock",
      value: stats.lowStock,
      icon: <AlertTriangle size={35} />,
      color: "from-red-600 to-red-500",
      textColor: "text-red-100"
    },
    {
      title: "Locations",
      value: stats.totalLocations,
      icon: <Warehouse size={35} />,
      color: "from-green-600 to-green-500",
      textColor: "text-green-100"
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-slate-800/50 rounded-2xl p-6 h-24 animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`bg-gradient-to-br ${card.color} text-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex justify-between items-center border border-white/10`}
        >
          <div>
            <h2 className="text-lg font-semibold opacity-90">{card.title}</h2>
            <p className={`text-4xl font-bold mt-2 ${card.textColor}`}>{card.value}</p>
          </div>
          <div className="opacity-70">{card.icon}</div>
        </div>
      ))}
    </div>
  );
}

export default SummaryCards;
