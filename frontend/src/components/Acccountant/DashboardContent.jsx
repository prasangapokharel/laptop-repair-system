import React from "react";
import {
  TrendingUp,
  PlusCircle,
  FilePlus,
  UserPlus,
  BarChart3,
} from "lucide-react";

// --- Helper Components used ONLY in the Dashboard ---

function DashboardCard({ title, children }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow">
      <h3 className="text-lg font-bold text-gray-700">{title}</h3>
      {children}
    </div>
  );
}

function Bar({ height, label }) {
  return (
    <div className="flex flex-col items-center flex-1 group cursor-pointer">
      <div
        className="w-full max-w-[24px] bg-emerald-400 rounded-t-sm group-hover:bg-emerald-500 transition-all duration-300"
        style={{ height: height }}></div>
      <span className="mt-2">{label}</span>
    </div>
  );
}

function ActionButton({ icon, label }) {
  return (
    <button className="flex items-center justify-center gap-2 py-4 px-4 border border-emerald-500 text-emerald-700 rounded-xl font-medium hover:bg-emerald-50 active:scale-95 transition-all">
      {icon}
      <span>{label}</span>
    </button>
  );
}
// ---------------------------------------------------

export default function DashboardContent() {
  return (
    <>
      {/* Top Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Card 1: Financial Overview */}
        <DashboardCard title="Financial Overview">
          <div className="mt-4">
            <h3 className="text-4xl font-bold text-gray-800 mb-2">
              Rs. 26,000
            </h3>
            <div className="flex items-center text-emerald-500 font-medium">
              <TrendingUp size={20} className="mr-1" />
              <span>12% Increase</span>
            </div>
          </div>
        </DashboardCard>

        {/* Card 2: Today's Revenue */}
        <DashboardCard title="Today's Revenue">
          <div className="mt-4">
            <h3 className="text-4xl font-bold text-gray-800 mb-4">Rs. 2500</h3>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div
                className="bg-emerald-400 h-3 rounded-full"
                style={{ width: "80%" }}></div>
            </div>
            <p className="text-sm text-gray-500">Target: Rs 3090</p>
          </div>
        </DashboardCard>
      </div>

      {/* Middle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Card 3: Pending Payments */}
        <DashboardCard title="Pending Payments">
          <div className="mt-4">
            <h3 className="text-4xl font-bold text-gray-800 mb-4">Rs. 1750</h3>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
              <div
                className="bg-emerald-400 h-3 rounded-full"
                style={{ width: "65%" }}></div>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Overdue: Rs 1250</span>
              <span>Due: Rs 550</span>
            </div>
          </div>
        </DashboardCard>

        {/* Card 4: Payments Statistics (Custom Bar Chart) */}
        <DashboardCard title="Payments Statistics">
          <div className="mt-6 flex items-end justify-between h-32 gap-2 text-xs text-gray-500">
            <Bar height="45%" label="Dec" />
            <Bar height="35%" label="Jan" />
            <Bar height="50%" label="Feb" />
            <Bar height="60%" label="Mar" />
            <Bar height="85%" label="Apr" />
            <Bar height="75%" label="May" />
            <Bar height="40%" label="Jun" />
          </div>
        </DashboardCard>
      </div>

      {/* Bottom Section: Quick Actions */}
      <DashboardCard title="Quick Payment Actions">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <ActionButton
            icon={<PlusCircle size={18} />}
            label="Record Payment"
          />
          <ActionButton icon={<FilePlus size={18} />} label="New Invoice" />
          <ActionButton icon={<UserPlus size={18} />} label="Add Customer" />
          <ActionButton
            icon={<BarChart3 size={18} />}
            label="Generate Report"
          />
        </div>
      </DashboardCard>
    </>
  );
}
