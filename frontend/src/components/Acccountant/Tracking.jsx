import React from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

// --- Mock Data ---
const incomeData = [
  { name: 'Jan', value: 1200 }, { name: 'Feb', value: 1800 },
  { name: 'Mar', value: 2400 }, { name: 'Apr', value: 3500 },
  { name: 'May', value: 3000 }, { name: 'Jun', value: 2000 },
  { name: 'Jul', value: 800 }, { name: 'Aug', value: 1100 },
  { name: 'Sep', value: 2300 }, { name: 'Oct', value: 3300 },
  { name: 'Nov', value: 4800 }, { name: 'Dec', value: 4000 },
];

const expenseData = [
  { name: 'Jan', value: 500 }, { name: 'Feb', value: 1200 },
  { name: 'Mar', value: 1600 }, { name: 'Apr', value: 1900 },
  { name: 'May', value: 2100 }, { name: 'Jun', value: 2300 },
  { name: 'Jul', value: 2500 }, { name: 'Aug', value: 2800 },
  { name: 'Sep', value: 3200 }, { name: 'Oct', value: 3800 },
  { name: 'Nov', value: 4400 }, { name: 'Dec', value: 5000 },
];

const paymentHistory = [
  { date: 'Dec 15, 2025', amount: 'Rs. 5600' },
  { date: 'Dec 17, 2025', amount: 'Rs. 6500' },
  { date: 'Dec 19, 2025', amount: 'Rs. 1200' },
  { date: 'Dec 23, 2025', amount: 'Rs. 3600' },
  { date: 'Dec 26, 2025', amount: 'Rs. 7700' },
  { date: 'Dec 28, 2025', amount: 'Rs. 8800' },
  { date: 'Dec 30, 2025', amount: 'Rs. 9200' },
];

const pieData = [
  { name: 'Paid', value: 69, color: '#3182CE' },
  { name: 'Outstanding', value: 31, color: '#FF8000' },
];

const NavButton = ({ label, active = false }) => (
  <button className={`px-6 py-2 rounded-md border text-sm font-medium transition-all ${
    active ? 'bg-[#10b981] text-white border-[#10b981] shadow-md' : 'bg-[#f3f4f6] text-gray-600 border-gray-300'
  }`}>
    {label}
  </button>
);

const Tracking = () => {
  return (
    <div className="p-8 bg-white min-h-screen text-[#2d3748] font-sans max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Financial Reports</h1>

      {/* Main Navigation */}
      <div className="flex gap-4 mb-10">
        <NavButton label="Income" active />
        <NavButton label="Expenses" />
        <NavButton label="Payments" />
        <NavButton label="Outstanding" />
      </div>

      {/* Income Reports Section */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Income Reports</h2>
          <div className="flex gap-2">
            <NavButton label="Daily" />
            <NavButton label="Weekly" />
            <NavButton label="Monthly" active />
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={incomeData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" verticalFill={['#fff']} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} tickFormatter={(val) => `Rs. ${val}`} />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Expenses Reports Section */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-6">Expenses Reports</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={expenseData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} tickFormatter={(val) => `Rs. ${val}`} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Payment History */}
        <div>
          <h2 className="text-xl font-bold mb-4">Payment History</h2>
          <div className="border border-gray-100 rounded-2xl p-6 bg-white shadow-sm">
            {paymentHistory.map((item, idx) => (
              <div key={idx} className="flex justify-between py-2 border-b last:border-0 border-gray-50 text-sm">
                <span className="text-gray-600 font-medium">{item.date}</span>
                <span className="text-gray-800 font-bold">{item.amount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Outstanding Payments */}
        <div>
          <h2 className="text-xl font-bold mb-4">Outstanding Payments</h2>
          <div className="flex items-center">
            <div className="w-64 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="ml-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[#3b82f6] font-bold text-sm">Rs. 5600</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#f97316] font-bold text-sm">Rs. 400</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tracking;