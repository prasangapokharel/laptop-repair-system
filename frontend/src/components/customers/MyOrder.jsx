import { jwtDecode } from "jwt-decode";
import React, { useState, useMemo, useEffect } from "react";

const STATUS_CONFIG = {
  Pending: { color: "bg-yellow-500", label: "Pending" },
  Repairing: { color: "bg-blue-500", label: "Repairing" },
  Completed: { color: "bg-green-500", label: "Completed" },
  Cancelled: { color: "bg-red-500", label: "Cancelled" },
};

// Status dot component
const StatusIndicator = ({ status }) => {
  const config = STATUS_CONFIG[status] || {
    color: "bg-gray-400",
    label: status,
  };
  return (
    <div className="flex items-center space-x-2">
      <span className={`w-3 h-3 rounded-full ${config.color}`}></span>
      <span className="hidden lg:inline text-sm font-medium text-gray-700">
        {config.label}
      </span>
    </div>
  );
};

// Filter buttons (desktop)
const FilterButtons = ({ activeFilter, setActiveFilter }) => {
  const statusKeys = ["Pending", "Repairing", "Completed", "Cancelled"];

  return (
    <div className="flex flex-wrap gap-2 md:gap-4">
      {statusKeys.map((status) => {
        const config = STATUS_CONFIG[status];
        const isActive = activeFilter === status;

        return (
          <button
            key={status}
            style={{ color: "black" }}
            onClick={() => setActiveFilter(status)}
            className={`px-4 py-2 font-semibold rounded-xl shadow-md transition-all ${
              isActive
                ? `${config.color} text-white shadow-lg`
                : `${config.color.replace("-500", "-400")} opacity-80`
            }`}>
            {status}
          </button>
        );
      })}
    </div>
  );
};

// Table header
const TableHeader = () => (
  <div className="hidden lg:grid grid-cols-7 gap-4 py-3 px-4 border-b text-left text-sm font-semibold text-gray-700 bg-gray-100/50 rounded-t-xl">
    <div>Order ID</div>
    <div>Customer</div>
    <div>Device</div>
    <div>Issue</div>
    <div>Date</div>
    <div>Status</div>
    <div>Actions</div>
  </div>
);

const MyOrder = () => {
  const [activeFilter, setActiveFilter] = useState("Pending");
  const [selectedDropdownStatus, setSelectedDropdownStatus] = useState("All");
  const [isMobileView, setIsMobileView] = useState(false);

  // FETCHED REAL ORDERS FROM API
  const [orders, setOrders] = useState([]);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // MAIN API CALL
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const decoded = jwtDecode(token);
        const userId = decoded.sub;

        // Fetch all 3 endpoints at the same time
        const [ordersRes, deviceRes, usersRes] = await Promise.all([
          fetch(`http://localhost:8000/v1/orders?customer_id=${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:8000/v1/devices"),
          fetch("http://localhost:8000/v1/users"),
        ]);

        const ordersData = await ordersRes.json();
        const deviceData = await deviceRes.json();
        const usersData = await usersRes.json();

        // Convert device list → map {id: name}
        const deviceMap = {};
        deviceData.forEach((d) => (deviceMap[d.id] = d.name));

        // Convert users list → map {id: full_name}
        const userMap = {};
        usersData.forEach((u) => (userMap[u.id] = u.full_name));

        // Format final output
        const finalOrders = ordersData.map((o) => ({
          id: o.id,
          customer: userMap[o.customer_id] || "Unknown",
          device: deviceMap[o.device_id] || "Unknown Device",
          issue: o.note,
          date: o.created_at.split("T")[0],
          status: o.status,
        }));

        setOrders(finalOrders);
      } catch (err) {
        console.error("Error loading orders:", err);
      }
    };

    fetchData();
  }, []);

  const currentFilter = isMobileView ? selectedDropdownStatus : activeFilter;

  const filteredOrders = useMemo(() => {
    if (currentFilter === "All") return orders;
    return orders.filter((order) => order.status === currentFilter);
  }, [orders, currentFilter]);

  const TableRow = ({ order }) => (
    <div className="hidden lg:grid grid-cols-7 gap-4 py-4 px-4 text-sm border-b border-gray-200">
      <div>{order.id}</div>
      <div>{order.customer}</div>
      <div>{order.device}</div>
      <div>{order.issue}</div>
      <div>{order.date}</div>
      <div>
        <StatusIndicator status={order.status} />
      </div>
      <div>
        <button className="px-3 py-1 bg-blue-600 text-white rounded-lg">
          View
        </button>
      </div>
    </div>
  );

  const MobileCard = ({ order }) => (
    <div className="lg:hidden p-4 mb-3 bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="flex justify-between mb-2 pb-2 border-b">
        <span className="text-lg font-bold text-blue-700">
          Order ID: {order.id}
        </span>
        <StatusIndicator status={order.status} />
      </div>

      <div className="space-y-1 text-sm text-gray-700">
        <p>
          <strong>Customer:</strong> {order.customer}
        </p>
        <p>
          <strong>Device:</strong> {order.device}
        </p>
        <p>
          <strong>Issue:</strong> {order.issue}
        </p>
        <p>
          <strong>Date:</strong> {order.date}
        </p>
      </div>

      <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-xl">
        View Details
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-200 p-4 md:p-8 font-inter">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700 mb-6">
          My Orders
        </h1>

        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-xl mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="lg:hidden w-full">
              <select
                value={selectedDropdownStatus}
                onChange={(e) => setSelectedDropdownStatus(e.target.value)}
                className="w-full rounded-xl border-gray-300 h-10">
                <option value="All">All</option>
                {Object.keys(STATUS_CONFIG).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden lg:block">
              <FilterButtons
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <TableHeader />

          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <React.Fragment key={order.id}>
                <TableRow order={order} />
                <MobileCard order={order} />
              </React.Fragment>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              No orders found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrder;
