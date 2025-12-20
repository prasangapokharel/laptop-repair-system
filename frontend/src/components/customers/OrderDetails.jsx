import React, { useEffect, useState } from "react";

// Reusable Components -------------------------------------------------------

const getStatusClasses = (status) => {
  switch (status) {
    case "Pending":
      return "bg-orange-500 text-white shadow-md shadow-orange-500/30";
    case "Paid":
      return "bg-green-500 text-white shadow-md shadow-green-500/30";
    case "Repairing":
    case "Completed":
      return "bg-blue-600 text-white shadow-md shadow-blue-600/30";
    default:
      return "bg-gray-400 text-white shadow-md shadow-gray-400/30";
  }
};

const InfoRow = ({
  label,
  value,
  valueClassName = "font-semibold text-gray-800",
}) => (
  <div className="flex justify-between md:justify-start md:gap-x-8 mb-2">
    <span className="text-gray-600 w-2/5 md:w-auto md:min-w-[180px] font-medium text-sm sm:text-base">
      {label}:
    </span>

    <span
      className={`text-right md:text-left w-3/5 md:w-auto ${valueClassName} wrap-break-word text-sm sm:text-base`}>
      {value}
    </span>
  </div>
);

const Card = ({
  title,
  children,
  bgColor = "bg-white",
  titleColor = "text-gray-900",
}) => (
  <div className={`rounded-xl shadow-lg p-5 md:p-6 ${bgColor} mb-6`}>
    <h2
      className={`text-lg sm:text-xl font-bold ${titleColor} mb-4 border-b border-gray-300/50 pb-2`}>
      {title}
    </h2>
    {children}
  </div>
);

// Status timeline ----------------------------------------------------------
const StatusHistory = ({ history }) => {
  const getTimelineStyle = (type) => {
    switch (type) {
      case "completed":
        return {
          icon: "text-white bg-blue-600",
          line: "bg-blue-300",
          text: "text-blue-700",
        };
      case "current":
        return {
          icon: "text-blue-600 bg-white border-2 border-blue-600",
          line: "bg-gray-300",
          text: "text-blue-800 font-bold",
        };
      default:
        return {
          icon: "bg-gray-400",
          line: "bg-gray-300",
          text: "text-gray-600",
        };
    }
  };

  return (
    <Card
      title="Status History"
      bgColor="bg-gray-200/50"
      titleColor="text-gray-700">
      <div className="relative pl-6 sm:pl-8">
        {history.map((item, index) => {
          const style = getTimelineStyle(item.type);
          const isLast = index === history.length - 1;

          return (
            <div key={index} className="flex mb-8 last:mb-0 items-start">
              {!isLast && (
                <div
                  className={`absolute left-[13px] top-4 -bottom-2.5 w-0.5 ${style.line}`}></div>
              )}

              <div
                className={`relative z-10 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${style.icon}`}></div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm sm:text-base ${style.text}`}>
                  {item.label}
                </p>
                <p className="text-xs sm:text-sm text-gray-500">{item.date}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// Device info --------------------------------------------------------------
const DeviceInformationSection = ({ data }) => (
  <Card
    title="Device Information"
    bgColor="bg-blue-100/50"
    titleColor="text-blue-700">
    <div className="space-y-2">
      <InfoRow label="Device Type" value={data.type} />
      <InfoRow label="Brand" value={data.brand} />
      <InfoRow label="Model" value={data.model} />
      <InfoRow label="Problem" value={data.problem} />
    </div>
  </Card>
);

// Payment info -------------------------------------------------------------
const PaymentInformationSection = ({ data }) => (
  <Card
    title="Payment Information"
    bgColor="bg-gray-100/50"
    titleColor="text-gray-700">
    <div className="space-y-2">
      <InfoRow
        label="Status"
        value={data.status}
        valueClassName={`${getStatusClasses(
          data.status
        )} px-3 py-1 rounded-full`}
      />
      <InfoRow label="Total Cost" value={`Rs. ${data.total_cost}`} />
      <InfoRow label="Discount" value={`Rs. ${data.discount}`} />
      <InfoRow label="Final Amount" value={`Rs. ${data.final}`} />
    </div>
  </Card>
);

// Main Component -----------------------------------------------------------
const OrderDetails = ({ userId }) => {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (userId) {
      loadOrder();
    }
  }, [userId]);

  const loadOrder = async () => {
    if (!userId) return;

    try {
      const res = await fetch(
        `http://localhost:8000/v1/orders?customer_id=${userId}`
      );
      const orders = await res.json();

      if (!orders.length) return;

      const order = orders[0];

      const [usersRes, devicesRes] = await Promise.all([
        fetch("http://localhost:8000/v1/users"),
        fetch("http://localhost:8000/v1/devices"),
      ]);

      const users = await usersRes.json();
      const devices = await devicesRes.json();

      const user = users.find((u) => u.id === order.customer_id);
      const device = devices.find((d) => d.id === order.device_id);

      const final = {
        id: order.id,
        date: order.created_at,
        status: order.status,
        customerName: user?.full_name || "Unknown",
        customerEmail: user?.email || "Unknown",

        device: {
          type: device?.name || "Unknown",
          brand: "Unknown",
          model: "Unknown",
          problem: order.note || "N/A",
        },

        payment: {
          status: order.status === "Completed" ? "Paid" : "Pending",
          total_cost: order.total_cost,
          discount: order.discount,
          final: order.total_cost,
        },

        statusHistory: [
          { label: "Order Created", date: order.created_at, type: "completed" },
          { label: "Repairing", date: order.updated_at, type: "current" },
          { label: "Ready for Pickup", date: "", type: "pending" },
        ],
      };

      setOrder(final);
    } catch (err) {
      console.log(err);
    }
  };

  if (!order) return <div className="p-6 text-lg">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-start mb-8 border-b-2 border-gray-300 pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-700">
              Order Details
            </h1>
            <p className="text-lg text-gray-500 mt-1">Order #{order.id}</p>
          </div>

          <div className="text-right p-4 bg-white shadow-md rounded-xl">
            <span
              className={`${getStatusClasses(
                order.status
              )} px-4 py-1 rounded-lg`}>
              {order.status}
            </span>
            <p className="text-sm text-gray-600">{order.date}</p>
            <p className="text-md font-semibold text-gray-800 mt-1">
              {order.customerName}
            </p>
            <p className="text-xs text-blue-500 break-all">
              {order.customerEmail}
            </p>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <DeviceInformationSection data={order.device} />
          </div>

          <div className="lg:col-span-1 space-y-6">
            <PaymentInformationSection data={order.payment} />
          </div>

          <div className="lg:col-span-3">
            <StatusHistory history={order.statusHistory} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default OrderDetails;
