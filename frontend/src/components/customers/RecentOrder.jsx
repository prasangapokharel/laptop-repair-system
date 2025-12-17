import React, { useEffect, useState } from "react";

export default function RecentOrder({ userId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return; // user not loaded yet

    const token = localStorage.getItem("token");

    const fetchOrders = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/v1/orders?customer_id=${userId}&limit=10&offset=0`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        // API returns either {data: [...] } or array
        const orderList = Array.isArray(data) ? data : data.data;

        setOrders(orderList || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg mt-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Orders</h2>
      <div className="overflow-x-auto">
        {loading ? (
          <p className="text-gray-500 text-sm">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-500 text-sm">No recent orders found.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["Order ID", "Date", "Status", "Amount"].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.id}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.created_at?.slice(0, 10) || "N/A"}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-500 text-white">
                      {order.status || "Unknown"}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Rs.{order.amount || "0"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-4 flex justify-end">
        <button className="text-blue-600 hover:text-blue-800 font-medium py-2 px-4 rounded-lg transition-colors border border-blue-600 hover:bg-blue-50">
          View All
        </button>
      </div>
    </div>
  );
}
