import React, { useEffect, useState } from "react";
import { User } from "lucide-react";
import StatCard from "./StatCard";
import RecentOrder from "./RecentOrder";
import QuickAction from "./QuickAction";
import Notification from "./Notification";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState(0);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found in localStorage");
      return;
    }

    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch (error) {
      console.error("Invalid JWT token:", error);
      return;
    }

    const userId = decoded.sub;
    if (!userId) {
      console.error("No user ID found in token");
      return;
    }

    const fetchUsers = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/v1/users?limit=100&offset=0`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const response = await res.json();

        // Check if backend returns {data: [...]}
        const allUsers = Array.isArray(response) ? response : response.data;

        if (!Array.isArray(allUsers)) {
          console.error("Unexpected API response format:", response);
          return;
        }

        const foundUser = allUsers.find((u) => String(u.id) === String(userId));

        setUser(foundUser || null);
        console.log("Fetched User:", foundUser);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/v1/orders?customer_id=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const orders = res.data || [];

        // Count pending
        const pendingCount = orders.filter(
          (o) => o.status === "Pending"
        ).length;

        // Active = anything that is NOT completed and NOT pending
        const activeCount = orders.filter(
          (o) => o.status !== "Completed" && o.status !== "Pending"
        ).length;

        setPending(pendingCount);
        setActive(activeCount);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      }
    };

    fetchUsers();
    fetchOrders();
  }, []);

  return (
    <main className="flex-1 p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-gray-300 mb-6">
        <h1 className="text-3xl font-bold text-blue-800 mb-4 md:mb-0">
          Welcome {user ? user.full_name : "Customer"}!
        </h1>

        <div className="bg-white p-4 rounded-xl shadow-md flex items-center space-x-4 border border-gray-200">
          <div className="shrink-0">
            <img
              className="h-12 w-12 rounded-full object-cover border-2 border-blue-500"
              src="https://placehold.co/100x100/3B82F6/ffffff?text=RB"
              alt="User Avatar"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://placehold.co/100x100/3B82F6/ffffff?text=User";
              }}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 flex items-center">
              {user?.full_name || "Loading..."}
              <User className="w-4 h-4 ml-1 text-blue-500" />
            </p>
            <p className="text-xs text-gray-500">ID: {user?.id || "-"}</p>
            <p className="text-xs text-gray-500">
              E-mail: {user?.email || "Not available"}
            </p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <StatCard
          title="Active Orders"
          count={active}
          bgColor="bg-blue-600"
          arrowColor="text-blue-200"
        />
        <StatCard
          title="Pending Orders"
          count={pending}
          bgColor="bg-green-600"
          arrowColor="text-green-200"
        />
      </div>

      <RecentOrder userId={user?.id} />
      <QuickAction />
      <Notification />
    </main>
  );
}
