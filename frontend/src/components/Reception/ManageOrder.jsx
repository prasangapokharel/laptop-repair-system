import React from "react";
import { Search, ChevronDown } from "lucide-react";

const orders = [
  {
    id: 1001,
    customer: "Ram Rai",
    device: "Laptop",
    status: "Completed",
  },
  {
    id: 1002,
    customer: "Sita Thapa",
    device: "Desktop",
    status: "In Progress",
  },
  {
    id: 1003,
    customer: "Hari Adhikari",
    device: "Tablet",
    status: "Pending",
  },
  {
    id: 1004,
    customer: "Rama K.",
    device: "Laptop",
    status: "On Hold",
  },
];

const statusStyles = {
  Completed: "bg-emerald-500 text-white",
  "In Progress": "bg-blue-600 text-white",
  Pending: "bg-red-500 text-white",
  "On Hold": "bg-orange-500 text-white",
};

const OrderManagement = () => {
  return (
    <div className="min-h-screen bg-white p-6 flex justify-center">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <h1 className="text-2xl font-semibold text-blue-600 mb-4">
          Order Management
        </h1>

        {/* Card */}
        <div className="bg-gray-200 rounded-xl border border-blue-300">
          {/* Top Controls */}
          <div className="flex justify-between items-center p-4">
            <div className="relative w-72">
              <Search
                size={18}
                className="absolute left-3 top-2.5 text-blue-500"
              />
              <input
                placeholder="Search Orders........."
                className="w-full pl-10 pr-4 py-2 rounded-full text-sm outline-none"
              />
            </div>

            <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-full text-sm shadow">
              Filter <ChevronDown size={16} />
            </button>
          </div>

          {/* Table */}
          <div className="overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-y">
                <tr>
                  <th className="text-left px-4 py-3">Order ID</th>
                  <th className="text-left px-4 py-3">Customer</th>
                  <th className="text-left px-4 py-3">Device</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-t hover:bg-gray-100"
                  >
                    <td className="px-4 py-3">{order.id}</td>
                    <td className="px-4 py-3">{order.customer}</td>
                    <td className="px-4 py-3">{order.device}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          statusStyles[order.status]
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg text-xs border">
                          Update Status <ChevronDown size={14} />
                        </button>
                        <button className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg text-xs border">
                          Assign To <ChevronDown size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-center gap-4 p-5 border-t">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium">
              Create Order
            </button>
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-medium">
              Reset Form
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
