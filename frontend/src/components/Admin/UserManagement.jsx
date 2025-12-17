import React from "react";
import { Search, Edit2 } from "lucide-react";

export default function UserManagement() {
  const users = [
    {
      name: "Sita Rai",
      email: "sitarai9865@gmail.com",
      role: "Admin",
      status: "Active",
    },
    {
      name: "Maushami Shah",
      email: "maushami87@gmail.com",
      role: "Customer",
      status: "Active",
    },
    {
      name: "Krishna Acharya",
      email: "krishnacharya@gmail.com",
      role: "Admin",
      status: "Inactive",
    },
    {
      name: "Hari Karki",
      email: "harikarki23@gmail.com",
      role: "Accountant",
      status: "Active",
    },
  ];

  return (
    <div className="bg-white p-8 rounded-3xl border shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h2 className="text-3xl font-bold">User Management</h2>
        <button className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95">
          Create New User
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            className="w-full pl-10 p-3 rounded-2xl border bg-gray-50 focus:bg-white outline-blue-500 transition-all"
            placeholder="Search users..."
          />
        </div>
        <select className="p-3 rounded-2xl border bg-gray-50 outline-blue-500">
          <option>Filter by Role</option>
        </select>
        <select className="p-3 rounded-2xl border bg-gray-50 outline-blue-500">
          <option>Filter by Status</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 font-bold text-sm uppercase">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u, i) => (
              <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                <td className="p-4 font-bold">{u.name}</td>
                <td className="p-4 text-gray-500">{u.email}</td>
                <td className="p-4 font-medium">{u.role}</td>
                <td className="p-4">
                  <span
                    className={`font-bold ${
                      u.status === "Active"
                        ? "text-emerald-500"
                        : "text-gray-400"
                    }`}>
                    {u.status}
                  </span>
                </td>
                <td className="p-4 flex justify-center gap-4 items-center">
                  <Edit2
                    size={18}
                    className="text-gray-400 cursor-pointer hover:text-blue-600 transition-colors"
                  />
                  <div
                    className={`w-10 h-5 rounded-full p-1 bg-gray-200 ${
                      u.status === "Active" ? "bg-emerald-400" : "bg-gray-300"
                    }`}>
                    <div
                      className={`bg-white w-3 h-3 rounded-full ${
                        u.status === "Active" ? "ml-auto" : ""
                      }`}></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
