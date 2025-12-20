import { Link } from "lucide-react";
import React from "react";
import CustomerRegistration from "./CustomerRegistration";

const CreateOrder = () => {
  return (
    <div className="min-h-screen bg-slate-100 flex justify-center py-10 px-4">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">
            Create Order
          </h1>
          <p className="text-sm text-slate-500">
            Fill in the details to create a new service order
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-md p-8 space-y-8">
          {/* Customer Section */}
          <section>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Customer Information
            </h3>

            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Search customer by name or phone"
                className="flex-1 rounded-xl border px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-xl text-sm font-medium" onClick={<CustomerRegistration/>}>
                + New Customer
              </button>
            </div>
          </section>

          {/* Device Section */}
          <section>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Device Details
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500">Device Type</label>
                <input
                  value="Laptop"
                  readOnly
                  className="w-full mt-1 rounded-xl border px-4 py-3 text-sm bg-slate-50"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500">Brand</label>
                <select className="w-full mt-1 rounded-xl border px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                  <option>Select Brand</option>
                </select>
              </div>
            </div>

            <div className="flex gap-6 mt-4 text-sm text-slate-600">
              <label className="flex items-center gap-2">
                <input type="radio" name="device" />
                Existing Device
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="device" />
                New Device
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <input
                placeholder="Model"
                className="rounded-xl border px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                placeholder="Serial Number"
                className="rounded-xl border px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <input
                placeholder="Purchase Year"
                className="rounded-xl border px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <select className="rounded-xl border px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                <option>Good</option>
                <option>Average</option>
                <option>Poor</option>
              </select>
            </div>
          </section>

          {/* Problem Section */}
          <section>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Problem Description
            </h3>
            <textarea
              rows="4"
              placeholder="Briefly describe the issue..."
              className="w-full rounded-xl border px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </section>

          {/* Cost Section */}
          <section>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Cost Estimation
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                placeholder="Service Charge"
                className="rounded-xl border px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                placeholder="Parts Cost"
                className="rounded-xl border px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </section>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <button className="px-6 py-3 rounded-xl text-sm font-medium bg-slate-200 hover:bg-slate-300">
              Reset
            </button>
            <button className="px-6 py-3 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white shadow">
              Create Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOrder;
