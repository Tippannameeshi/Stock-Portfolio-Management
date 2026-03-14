import React from "react";
import {
  BarChart3,
  Activity,
  DollarSign,
  Star,
  History,
  Shield,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const Sidebar = ({ currentPage, onNavigate }) => {
  const { isAdmin } = useAuth();
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "market", label: "Market", icon: Activity },
    { id: "funds", label: "Funds", icon: DollarSign },
    { id: "watchlist", label: "Watchlist", icon: Star },
    { id: "history", label: "History", icon: History },
    { id: "admin", label: "Admin Panel", icon: Shield, adminOnly: true },
  ];

  return (
    <aside className="w-64 bg-white shadow-lg min-h-[calc(100vh-73px)] border-r border-gray-200">
      <nav className="p-4 space-y-1">
        {navItems
          .filter((item) => !item.adminOnly || isAdmin())
          .map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
                {item.adminOnly && (
                  <span className="ml-auto text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                    Admin
                  </span>
                )}
              </button>
            );
          })}
      </nav>
    </aside>
  );
};

export default Sidebar;
