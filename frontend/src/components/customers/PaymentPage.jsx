import { useState } from "react";

export default function PaymentPage() {
  const paymentSchema = {
    orderId: "",
    dueAmount: "",
    amount: "",
    status: "",
    method: "",
    transactionId: "",
  };
  const [method, setMethod] = useState("Cash");
  const [paymentdata, setPaymentdata] = useState(paymentSchema);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentdata({ ...paymentdata, [name]: value });
  };

  const submitpayment = (e) => {
    e.preventDefault();
    const paymentdata = {
      orderId: e.target.orderId.value,
      dueAmount: e.target.dueAmount.value,
      amount: e.target.amount.value,
      method: method,
      transactionId: e.target.transactionId ? e.target.transactionId.value : "",
    };
    console.log("Payment Data Submitted:", paymentdata);
    alert("Payment Submitted Successfully!", paymentdata);
    // Here you can add the logic to send paymentdata to the backend API
  };

  const payments = [
    {
      id: "001",
      order: "1235",
      method: "eSewa",
      amount: "Rs.2000",
      date: "01 Jan 2024",
      transaction: "TRX000001",
    },
    {
      id: "002",
      order: "1234",
      method: "Khalti",
      amount: "Rs.3000",
      date: "02 Jan 2024",
      transaction: "TRX000002",
    },
    {
      id: "003",
      order: "1236",
      method: "Cash",
      amount: "Rs.4000",
      date: "05 Feb 2024",
      transaction: "TRX000003",
    },
    {
      id: "004",
      order: "1237",
      method: "Card",
      amount: "Rs.5000",
      date: "08 Mar 2024",
      transaction: "TRX000004",
    },
  ];

  return (
    <div className="min-h-screen bg-blue-600 p-4 flex flex-col items-center gap-8">
      {/* Top Section */}
      <div className="w-full max-w-6xl bg-blue-600 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 col-span-1">
          <h2 className="text-blue-600 font-bold text-lg mb-4">Payment</h2>

          <form onSubmit={submitpayment} onChange={handleChange}>
            <div className="space-y-3">
              <Input label="Customer" value={1} type="hidden" name="customer" />
              <Input label="Invoice Number/Order ID" name="orderId" />
              <Input label="Due Amount" name="dueAmount" />
              <Input label="Payment" name="amount" />
              <Input label="Notes" name="transactionId" />

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
                  Pay Now
                </button>
                <button className="bg-gray-300 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-400">
                  Reset
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Due Amount & Payment Method */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          {/* Due Amount */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold mb-3">Due Amount</h3>

            <div className="space-y-2 text-sm">
              <Row label="Total Due" value="Rs.2000" />
              <Row label="Paid" value="Rs.0" />
              <Row label="Remaining Due" value="Rs.2000" bold />
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold mb-3 text-center">Payment</h3>

            <div className="space-y-3">
              {["Cash", "Card", "Mobile Banking", "Online Transfer"].map(
                (item) => (
                  <label
                    key={item}
                    className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      checked={method === item}
                      onChange={() => setMethod(item)}
                    />
                    <span className="text-sm font-medium">{item}</span>
                  </label>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white w-full max-w-6xl rounded-xl shadow-lg p-6">
        <h2 className="text-blue-600 font-bold mb-4">Payment History</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-gray-200 text-left">
              <tr>
                <th className="p-2">Payment ID</th>
                <th className="p-2">Order ID</th>
                <th className="p-2">Method</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Date</th>
                <th className="p-2">Transaction</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-2">{item.id}</td>
                  <td className="p-2">{item.order}</td>
                  <td className="p-2">{item.method}</td>
                  <td className="p-2">{item.amount}</td>
                  <td className="p-2">{item.date}</td>
                  <td className="p-2">{item.transaction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button className="mt-4 bg-green-500 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-green-600">
          View All
        </button>
      </div>
    </div>
  );
}

// Reusable Input
const Input = ({ label, value = "", name = "", type = "text" }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      name={name}
      defaultValue={value}
      className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
      placeholder={label}
    />
  </div>
);

// Reusable Row
const Row = ({ label, value, bold }) => (
  <div className="flex justify-between">
    <span className="text-gray-600">{label}</span>
    <span className={bold ? "font-bold text-black" : "text-black"}>
      {value}
    </span>
  </div>
);
