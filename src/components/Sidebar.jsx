import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  Box,
  MapPin,
  Users,
  Package,
  UserCircle
} from "lucide-react";

export default function Sidebar() {

  const navItems = [

    {
      to: "/admin",
      label: "Dashboard",
      Icon: LayoutDashboard
    },

    {
      to: "/items",
      label: "Items",
      Icon: Box
    },

    {
      to: "/locations",
      label: "Locations",
      Icon: MapPin
    },

    {
      to: "/stocks",
      label: "Stocks",
      Icon: Package
    },

    {
      to: "/users",
      label: "Users",
      Icon: Users
    },

    {
      to: "/profile",
      label: "Profile",
      Icon: UserCircle
    }
  ];

  return (

    <div className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white p-6">

      <h1 className="text-3xl font-bold mb-10">

        Inventory

      </h1>

      <div className="space-y-3">

        {navItems.map(
          ({ to, label, Icon }) => (

            <NavLink
              key={label}
              to={to}
              className={({ isActive }) =>

                `flex items-center gap-3 p-4 rounded-xl transition

                ${
                  isActive
                    ? "bg-blue-600"
                    : "hover:bg-slate-800"
                }`
              }
            >

              <Icon size={20} />

              {label}

            </NavLink>
          )
        )}

      </div>

    </div>
  );
}