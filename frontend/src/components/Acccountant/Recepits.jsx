import React from 'react';
import { Search, ChevronDown, Download } from 'lucide-react';

const paymentData = [
  { id: "12345", name: "Saina Rajput", device: "UltraBook", amount: "Rs. 80000", status: "Paid" },
  { id: "76543", name: "Prem Acharya", device: "MacBook", amount: "Rs. 30000", status: "Partial" },
  { id: "09876", name: "Hari Shastri", device: "MotoPOR", amount: "Rs. 4500", status: "Due" },
  { id: "45678", name: "Rima Shrestha", device: "Moto 1 Phanton", amount: "Rs. 98000", status: "Paid" },
  { id: "87652", name: "Preshna Karki", device: "Laptop 7", amount: "Rs. 5699", status: "Unpaid" },
  { id: "18520", name: "Oamn Niroula", device: "Ford U", amount: "Rs. 87430", status: "Due" },
  { id: "63062", name: "Simran Thapa", device: "Semel Cel", amount: "Rs. 9200", status: "Partial" },
  { id: "02947", name: "Ankita Rai", device: "UltraBook", amount: "Rs. 80000", status: "Unpaid" },
];

const StatusBadge = ({ status }) => {
  const styles = {
    Paid: "bg-[#10b981] text-white",
    Partial: "bg-[#f59e0b] text-white",
    Due: "bg-[#2563eb] text-white",
    Unpaid: "bg-[#ef4444] text-white",
  };

  return (
    <span className={`px-4 py-1 rounded text-xs font-semibold shadow-sm w-20 text-center inline-block ${styles[status]}`}>
      {status}
    </span>
  );
};

const InputField = ({ placeholder, icon: Icon, type = "text", isSelect = false }) => (
  <div className="relative mb-3">
    {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />}
    <input
      type={type}
      placeholder={placeholder}
      className={`w-full bg-[#f9fafb] border border-gray-200 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 ${Icon ? 'pl-10' : ''}`}
    />
    {isSelect && <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />}
  </div>
);

const PaymentHistory = () => {
  return (
    <div className="p-8 bg-white min-h-screen text-[#2d3748] font-sans max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-[#1e293b]">Payment History and Receipts</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search" 
            className="border border-gray-300 rounded-md py-1 pl-10 pr-4 text-sm focus:outline-none"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="border border-gray-200 rounded-lg shadow-sm mb-10 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-white">
          <h2 className="text-lg font-bold text-[#334155]">Complete Payment History</h2>
          <button className="bg-[#10b981] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-[#059669] transition-colors shadow-sm">
            Download Receipt
          </button>
        </div>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-sm font-semibold text-gray-600 border-b-2 border-blue-400">
              <th className="px-6 py-4">Payment ID</th>
              <th className="px-6 py-4">Customer's Name</th>
              <th className="px-6 py-4">Device</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paymentData.map((row, idx) => (
              <tr key={idx} className="text-sm hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-600">{row.id}</td>
                <td className="px-6 py-4 font-medium text-gray-800">{row.name}</td>
                <td className="px-6 py-4 text-gray-600">{row.device}</td>
                <td className="px-6 py-4 font-bold text-gray-800">{row.amount}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Search/Filter Panel */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm max-w-2xl">
        <h2 className="text-xl font-bold mb-6 text-[#1e293b]">Payment Search</h2>
        
        <div className="space-y-4">
          <InputField placeholder="Search payments" icon={Search} />
          <InputField placeholder="Payment ID" />
          <InputField placeholder="Customer Name" />
          <InputField placeholder="Date Range" isSelect />
          <InputField placeholder="Amount Range" />
          <InputField placeholder="Device Type" isSelect />
          <InputField placeholder="Service Category" isSelect />
        </div>

        <h2 className="text-xl font-bold mt-10 mb-4 text-[#1e293b]">Payment Search</h2>
        <InputField placeholder="Heltires" />
      </div>
    </div>
  );
};

export default PaymentHistory;