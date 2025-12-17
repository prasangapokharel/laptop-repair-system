import React, { useState } from "react";
import { Search } from "lucide-react";

// --- 1. Sample Data ---
// Define the data array outside the component for cleaner state management later
const PAYMENTS_DATA = [
  {
    id: "001",
    date: "Dec 29, 2025",
    customer: "Alina Tamang",
    amount: 25000,
    status: "Paid",
  },
  {
    id: "002",
    date: "Dec 25, 2025",
    customer: "Surya Rai",
    amount: 76000,
    status: "Partial",
  },
  {
    id: "003",
    date: "Dec 23, 2025",
    customer: "Sadesh Acharya",
    amount: 5600,
    status: "Unpaid",
  },
  {
    id: "004",
    date: "Dec 20, 2025",
    customer: "Bhim Karki",
    amount: 55000,
    status: "Paid",
  },
];

// Define the filter options
const FILTER_OPTIONS = ["Paid", "Due", "Unpaid", "Partial"];

// --- 2. Helper Components (Keep Logic Simple) ---

// Component for the colored status labels
const StatusBadge = ({ status }) => {
  let colorClasses = "";

  // Use a simple switch for clear color assignment
  switch (status) {
    case "Paid":
      colorClasses = "bg-emerald-500";
      break;
    case "Partial":
      colorClasses = "bg-orange-400";
      break;
    case "Unpaid":
      colorClasses = "bg-red-400";
      break;
    default:
      colorClasses = "bg-gray-400";
  }

  return (
    <span
      className={`inline-block px-3 py-1 text-sm font-medium text-white rounded-lg ${colorClasses}`}>
      {status}
    </span>
  );
};

// Component for the interactive filter buttons above the table
const FilterButton = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-2 text-sm font-medium rounded-xl border transition-colors duration-200
      ${
        isActive
          ? "bg-blue-600 border-blue-600 text-white shadow-md" // Active style
          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
      } // Inactive style
    `}>
    {label}
  </button>
);

// --- 3. Main Payments Content Component ---

export default function PaymentContent() {
  // We use state to track which main filter is currently active
  const [activeFilter, setActiveFilter] = useState("Paid"); // Set 'Paid' as default active filter

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 min-h-[70vh]">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Payment Management</h2>
      </div>

      {/* Search Bar and Action Button */}
      <div className="flex flex-col gap-3 md:flex-row md:gap-4 mb-6">
        <div className="relative flex-grow">
          <Search
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search payments"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
          />
        </div>
        <button className="flex-shrink-0 px-6 py-3 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition-colors active:scale-[0.98]">
          Create Payment
        </button>
      </div>

      {/* Interactive Filter Pills Section (Top Row) */}
      <div className="flex flex-wrap gap-2 mb-8 p-4 border border-blue-400 rounded-xl bg-blue-50">
        {/* We use map to render filter buttons cleanly */}
        {FILTER_OPTIONS.map((filter) => (
          <FilterButton
            key={filter}
            label={filter}
            // Set 'Paid' as active initially for demonstration
            isActive={filter === "Paid"}
            onClick={() => setActiveFilter(filter)}
          />
        ))}
      </div>

      {/* Payment Table Container */}
      <div className="overflow-x-auto border border-gray-200 rounded-xl">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Table Header (Top Row of the table, including the small buttons) */}
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment ID
              </th>
              {/* These headers use FilterButtons to match your image design */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>

          {/* Table Body (Looping through the data) */}
          <tbody className="bg-white divide-y divide-gray-200">
            {PAYMENTS_DATA.map((payment) => (
              <tr
                key={payment.id}
                className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {payment.id}
                </td>
                {/* Date column for the main date display */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {payment.date}
                </td>
                {/* The next two empty <td> cells are necessary to visually align with the 
                    three filter buttons in the header, mirroring the design exactly. */}

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {payment.customer}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">
                  Rs. {payment.amount.toLocaleString("en-IN")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={payment.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
