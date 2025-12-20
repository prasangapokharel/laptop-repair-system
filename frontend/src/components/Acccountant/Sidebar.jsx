import React from "react";
import {
  LayoutDashboard,
  CreditCard,
  Receipt,
  User,
  Settings,
  FileText,
  LogOut,
  ShieldCheck,
} from "lucide-react";

function SidebarLink({ icon, label, isSelected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(label)}
      className={`
        flex items-center gap-3 w-full px-4 py-2 rounded-lg transition-all duration-200
        ${
          isSelected
            ? "bg-blue-500/40 text-white font-medium shadow-sm border-l-4 border-white"
            : "text-blue-100 hover:bg-blue-700 hover:text-white"
        }
      `}>
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );
}

export default function Sidebar({
  isSidebarOpen,
  selectedItem,
  setSelectedItem,
}) {
  return (
    <aside
      className={`
      fixed inset-y-0 left-0 z-30 w-64 bg-blue-600 text-white transform transition-transform duration-300 ease-in-out
      lg:translate-x-0 lg:static lg:inset-0
      ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
    `}>
      <div className="flex flex-col h-full">
        {/* Logo / User Section */}
        <div className="flex flex-col items-center pt-10 pb-8 border-b border-blue-500/30">
          <div className="absolute top-4 left-4 w-8 h-8 rounded-full border border-white/50 flex items-center justify-center opacity-70">
            <span className="text-[10px]">LOGO</span>
          </div>

          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-blue-600 mb-3 shadow-lg">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-lg font-semibold">Accountant</h2>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <SidebarLink
            icon={<LayoutDashboard size={22} />}
            label="Dashboard"
            isSelected={selectedItem === "Dashboard"}
            onSelect={setSelectedItem}
          />
          <SidebarLink
            icon={<CreditCard size={22} />}
            label="Payments"
            isSelected={selectedItem === "Payments"}
            onSelect={setSelectedItem}
          />
          <SidebarLink
            icon={<Receipt size={22} />}
            label="Receipts"
            isSelected={selectedItem === "Receipts"}
            onSelect={setSelectedItem}
          />
          <SidebarLink
            icon={<FileText size={22} />}
            label="Tracking"
            isSelected={selectedItem === "Tracking"}
            onSelect={setSelectedItem}
          />
          <SidebarLink
            icon={<User size={22} />}
            label="Profile"
            isSelected={selectedItem === "Profile"}
            onSelect={setSelectedItem}
          />
          <SidebarLink
            icon={<Settings size={22} />}
            label="Settings"
            isSelected={selectedItem === "Settings"}
            onSelect={setSelectedItem}
          />
          <SidebarLink
            icon={<FileText size={22} />}
            label="Reports"
            isSelected={selectedItem === "Reports"}
            onSelect={setSelectedItem}
          />
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-blue-500/30">
          <button className="flex items-center gap-3 w-full px-4 py-2 text-white/80 hover:text-white hover:bg-blue-700 rounded-lg transition-colors">
            <LogOut size={22} />
            <span className="text-sm">Log out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
