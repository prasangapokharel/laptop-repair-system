import React from "react";

export default function Payments() {
  const data = [
    {
      id: "001",
      date: "Dec 29, 2025",
      name: "Alina Tamang",
      amount: "25000",
      status: "Paid",
    },
    {
      id: "002",
      date: "Dec 25, 2025",
      name: "Surya Rai",
      amount: "76000",
      status: "Partial",
    },
    {
      id: "003",
      date: "Dec 23, 2025",
      name: "Sadesh Acharya",
      amount: "5600",
      status: "Unpaid",
    },
    {
      id: "004",
      date: "Dec 20, 2025",
      name: "Bhim Karki",
      amount: "55000",
      status: "Paid",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow-sm border">
      <h2 className="text-2xl font-bold mb-6">Payment Management</h2>

      <div className="flex justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Search payments"
          className="flex-1 border p-2 rounded-lg"
        />
        <button className="bg-emerald-500 text-white px-6 py-2 rounded-lg font-medium">
          Create Payment
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {["Paid", "Due", "Unpaid", "Partial"].map((f) => (
          <button
            key={f}
            className={`px-4 py-1 border rounded-md ${
              f === "Paid" ? "bg-emerald-500 text-white" : "bg-white"
            }`}>
            {f}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto border-2 border-blue-400 rounded-lg p-4">
        <table className="w-full text-left">
          <thead className="border-b">
            <tr className="text-gray-500">
              <th className="pb-4">Payment ID</th>
              <th className="pb-4">Date</th>
              <th className="pb-4">Customer</th>
              <th className="pb-4">Amount</th>
              <th className="pb-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="border-b last:border-0">
                <td className="py-4">{row.id}</td>
                <td className="py-4">{row.date}</td>
                <td className="py-4 font-medium">{row.name}</td>
                <td className="py-4">Rs. {row.amount}</td>
                <td className="py-4">
                  <span
                    className={`px-3 py-1 rounded text-white text-sm ${
                      row.status === "Paid"
                        ? "bg-emerald-500"
                        : row.status === "Partial"
                        ? "bg-orange-400"
                        : "bg-orange-500"
                    }`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
