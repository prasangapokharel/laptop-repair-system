import React from "react";

export default function RoleManagement() {
  const roles = [
    "Admin",
    "Technician",
    "Customer Support",
    "Inventory Manager",
    "Marketing",
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Role Management</h2>
        <button className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
          <span>+ Create New Role</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Role List */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="text-xl font-bold mb-4">Role Lists</h3>
          <div className="overflow-hidden border rounded-lg">
            <table className="w-full text-left">
              <thead className="bg-blue-50 border-b">
                <tr>
                  <th className="p-3">Role Name</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {roles.map((role) => (
                  <tr key={role} className="hover:bg-gray-50">
                    <td className="p-3 font-medium">{role}</td>
                    <td className="p-3 space-x-2">
                      <button className="bg-blue-600 text-white text-xs px-3 py-1 rounded">
                        Edit
                      </button>
                      <button className="bg-blue-600 text-white text-xs px-3 py-1 rounded">
                        Assign to Users
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Permission View */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Role Permissions View</h3>
            <select className="border p-1 rounded">
              <option>Admin</option>
            </select>
          </div>
          <div className="space-y-4">
            {[
              "View Dashboard",
              "Manage Users",
              "Manage Orders",
              "Manage Roles",
              "View Reports",
            ].map((perm) => (
              <div key={perm} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-emerald-500 text-white rounded flex items-center justify-center">
                  ✓
                </div>
                <span className="text-gray-700">{perm}</span>
              </div>
            ))}
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 rounded"></div>
              <span className="text-gray-700">Update Inventory</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
