import React, { useState } from "react";
import { Menu, X } from "lucide-react";

// Import Separated Components
import Sidebar from "./Acccountant/Sidebar";
import DashboardContent from "./Acccountant/DashboardContent";
import PlaceholderContent from "./Acccountant/PlaceholderContent";
import PaymentContent from "./Acccountant/PayamentContent";

export default function AccountantPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState("Dashboard");

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Component to handle conditional display of main content
  const MainContent = () => {
    switch (selectedItem) {
      case "Dashboard":
        return <DashboardContent />;
      case "Payments":
        return <PaymentContent />;
      case "Receipts":
        return (
          <PlaceholderContent
            title="Receipts Tracking"
            description="Upload, view, and categorize all incoming receipts and documents."
          />
        );
      case "Profile":
        return (
          <PlaceholderContent
            title="User Profile Settings"
            description="Update account information, password, and preferences here."
          />
        );
      case "Settings":
        return (
          <PlaceholderContent
            title="Application Settings"
            description="Manage app-wide configurations, integrations, and user roles."
          />
        );
      case "Reports":
        return (
          <PlaceholderContent
            title="Financial Reporting"
            description="Generate and download detailed financial statements and custom reports."
          />
        );
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      {/* Mobile Menu Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar Component */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
      />

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white shadow-sm lg:hidden p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">{selectedItem}</h1>
          <button onClick={toggleSidebar} className="text-gray-600">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <h1 className="hidden lg:block text-3xl font-bold text-gray-800 mb-8">
            {selectedItem}'s View
          </h1>

          {/* Conditional Content Rendered Here */}
          <MainContent />
        </div>
      </main>
    </div>
  );
}
