import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Laptop,
  Package,
  ClipboardList,
  DollarSign,
  Menu,
  X,
  ChevronDown,
  CheckCircle,
  LayoutDashboard,
  User,
  PlusCircle,
} from "lucide-react";

// Import your existing components

import HomePage from "./customers/HomePage";
import MyDevice from "./customers/MyDevice";
import MyOrder from "./customers/MyOrder";
import OrderDetails from "./customers/OrderDetails";

const navItems = [
  { icon: Home, label: "Home" },
  { icon: Laptop, label: "My Device" },
  { icon: Package, label: "My Order" },
  { icon: ClipboardList, label: "Order Details" },
  { icon: DollarSign, label: "Payment" },
];

// --- NavItem Component ---
const NavItem = ({ icon: Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center p-3 text-sm font-medium transition-colors duration-200 ${
      isActive
        ? "bg-blue-600 text-white rounded-r-full shadow-lg"
        : "text-blue-200 hover:bg-blue-700 hover:text-white rounded-r-full"
    }`}>
    <Icon className="w-5 h-5 mr-4" />
    <span>{label}</span>
  </button>
);

// --- Sidebar Component ---
const Sidebar = ({ isOpen, onClose, activePage, setActivePage }) => (
  <>
    {/* Overlay for mobile */}
    <div
      className={`fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden transition-opacity ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
      onClick={onClose}
    />

    {/* Sidebar Content */}
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-blue-800 transform lg:translate-x-0 transition-transform duration-300 ease-in-out shadow-2xl ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
      <div className="flex items-center justify-between p-5 h-16 bg-blue-900 border-b border-blue-700">
        <h1 className="text-xl font-bold text-white flex items-center">
          <LayoutDashboard className="w-6 h-6 mr-2" />
          Dashboard
        </h1>
        <button
          onClick={onClose}
          className="text-blue-200 lg:hidden hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex flex-col space-y-2 p-4 pt-8">
        {navItems.map((item) => (
          <NavItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            isActive={item.label === activePage}
            onClick={() => {
              setActivePage(item.label);
              onClose();
            }}
          />
        ))}
      </nav>
    </div>
  </>
);

// --- Main Dashboard Component ---
const CustomerDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("Home");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();

  // useEffect(() => {
  //   const token = localStorage.getItem("token");

  //   console.log("I am running");
  //   if (!token) {
  //     navigate("/createaccount");
  //   } else {
  //     console.log("User is logged in");
  //     localStorage.removeItem("token");
  //   }
  //   setCheckingAuth(false);
  // }, [navigate]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  if (checkingAuth) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex font-inter">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        activePage={activePage}
        setActivePage={setActivePage}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col">
        {/* Top Header for mobile */}
        <header className="sticky top-0 z-30 bg-blue-900 lg:hidden flex items-center justify-between p-4 h-16 shadow-md">
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <button
            onClick={toggleSidebar}
            className="text-white hover:text-blue-200">
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8">
          {/* Conditional Rendering of Pages */}
          {activePage === "Home" && <HomePage />}
          {activePage === "My Device" && <MyDevice />}
          {activePage === "My Order" && <MyOrder />}
          {activePage === "Order Details" && <OrderDetails />}
          {/* {activePage === "My Device" && <MyDevice />}
          {activePage === "My Order" && <MyOrder />}
          {activePage === "Order Details" && <RecentOrder />}
          {activePage === "Payment" && <QuickAction />} */}

          {/* Notifications can stay below or move inside each page as needed */}
          {/* <Notification /> */}
        </main>
      </div>
    </div>
  );
};

export default CustomerDashboard;
