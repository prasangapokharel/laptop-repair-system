import React from "react";
import { TrendingUp } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Accountant's Dashboard</h1>

      {/* Top Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <StatCard
          title="Financial Overview"
          value="Rs. 26,000"
          sub={
            <span className="text-green-500 flex items-center">
              <TrendingUp size={16} className="mr-1" /> 12% Increase
            </span>
          }
        />
        <StatCard
          title="Today's Revenue"
          value="Rs. 2500"
          progress={80}
          footer="Target: Rs 3090"
        />
        <StatCard
          title="Pending Payments"
          value="Rs. 1750"
          progress={60}
          footer="Overdue: Rs 1250 | Due: Rs 550"
        />
        <StatCard title="Payments Statistics" isChart />
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="font-bold mb-4">Quick Payment Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ActionButton label="Record Payment" icon="📝" />
          <ActionButton label="New Invoice" icon="📂" />
          <ActionButton label="Add Customer" icon="👤" />
          <ActionButton label="Generate Report" icon="📊" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, sub, progress, footer, isChart }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <h3 className="text-gray-600 font-medium mb-4">{title}</h3>
      {isChart ? (
        <div className="flex items-end justify-between h-32 pt-4">
          {[40, 30, 45, 60, 90, 80, 50].map((h, i) => (
            <div
              key={i}
              className="w-6 bg-emerald-500 rounded-t"
              style={{ height: `${h}%` }}></div>
          ))}
        </div>
      ) : (
        <>
          <div className="text-3xl font-bold mb-2">{value}</div>
          {sub && <div>{sub}</div>}
          {progress && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 my-4">
              <div
                className="bg-emerald-500 h-2.5 rounded-full"
                style={{ width: `${progress}%` }}></div>
            </div>
          )}
          {footer && <div className="text-sm text-gray-500 mt-2">{footer}</div>}
        </>
      )}
    </div>
  );
}

function ActionButton({ label, icon }) {
  return (
    <button className="flex items-center justify-center space-x-2 border-2 border-emerald-500 text-emerald-700 p-3 rounded-lg hover:bg-emerald-50 transition">
      <span>{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}
