import React, { useState } from "react";
import Dashboard from "./Admin/Dashboard";
import Payments from "./Admin/Payments";
import Profile from "./Admin/Profile";
import SideBar from "./Admin/SideBar";
import UserManagement from "./Admin/UserManagement";
import RoleManagement from "./Admin/RoleManagement";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Helper to render the correct component
  const renderContent = () => {
    switch (activeTab) {
      case "Dashboard":
        return <Dashboard />;
      case "Payments":
        return <Payments />;
      case "Profile":
        return <Profile />;
      case "Users":
        return <UserManagement />;
      case "Role":
        return <RoleManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar Component */}
      <SideBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {/* Mobile Header Toggle */}
        <button
          className="lg:hidden mb-4 p-2 bg-blue-600 text-white rounded"
          onClick={() => setIsMobileMenuOpen(true)}>
          Menu
        </button>

        {renderContent()}
      </main>
    </div>
  );
}
