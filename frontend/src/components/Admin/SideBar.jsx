import React from "react";
import {
  LayoutDashboard,
  CreditCard,
  Receipt,
  User,
  Settings,
  FileText,
  LogOut,
  Shield,
  Users,
  ShieldCheck,
} from "lucide-react";

export default function SideBar({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
}) {
  const menuItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Users", icon: <Users size={20} /> },
    { name: "Role", icon: <ShieldCheck size={20} /> },
    { name: "Payments", icon: <CreditCard size={20} /> },
    { name: "Receipts", icon: <Receipt size={20} /> },
    { name: "Profile", icon: <User size={20} /> },
    { name: "Settings", icon: <Settings size={20} /> },
    { name: "Reports", icon: <FileText size={20} /> },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-blue-600 text-white transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform lg:translate-x-0 lg:static`}>
      <div className="flex flex-col h-full p-6">
        {/* User Profile / Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-blue-600 mb-2">
            <Shield size={40} fill="currentColor" />
          </div>
          <h2 className="text-xl font-semibold">Accountant</h2>
        </div>

        {/* Nav Links */}
        <nav className="space-y-2 flex-1">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                setActiveTab(item.name);
                setIsOpen(false);
              }}
              className={`flex items-center space-x-3 w-full p-3 rounded-md transition ${
                activeTab === item.name ? "bg-blue-500" : "hover:bg-blue-500/50"
              }`}>
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <button className="flex items-center space-x-3 p-3 mt-auto hover:bg-blue-500 rounded-md">
          <LogOut size={20} />
          <span>Log out</span>
        </button>

        {/* Close button for mobile */}
        <button
          className="lg:hidden mt-4 text-xs underline"
          onClick={() => setIsOpen(false)}>
          Close Menu
        </button>
      </div>
    </aside>
  );
}
