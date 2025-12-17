import React from "react";

export default function Profile() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Profile Card */}
      <div className="bg-slate-200 p-8 rounded-3xl flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-white rounded-2xl mb-10"></div>
        <h2 className="text-2xl font-bold mb-6">Guddu Karn</h2>
        <div className="text-left w-full space-y-4">
          <div>
            <p className="text-xs text-gray-500">Role</p>
            <p className="font-bold">Admin</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Email</p>
            <p className="font-bold">guddukarn2468@gmail.com</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Phone</p>
            <p className="font-bold">9876543210</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Location</p>
            <p className="font-bold">Itahari-4, Sunsari</p>
          </div>
        </div>
      </div>

      {/* Settings Side */}
      <div className="lg:col-span-2 space-y-6">
        {/* Change Password */}
        <div className="bg-slate-200 p-6 rounded-3xl">
          <h3 className="font-bold mb-4">Change Password</h3>
          <div className="space-y-3">
            <input
              className="w-full p-2 rounded border"
              placeholder="Current Password"
              type="password"
            />
            <input
              className="w-full p-2 rounded border"
              placeholder="New Password"
              type="password"
            />
            <input
              className="w-full p-2 rounded border"
              placeholder="Confirm New Password"
              type="password"
            />
            <button className="bg-emerald-500 text-white px-6 py-2 rounded-lg ml-auto block">
              Save
            </button>
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-slate-200 p-6 rounded-3xl">
          <h3 className="font-bold mb-4">Account Settings</h3>
          <div className="space-y-4">
            <Toggle label="Email Notification" active />
            <Toggle label="SMS Notification" active />
            <Toggle label="Location Services" />
            <Toggle label="Two-factor Authentication" active />
            <button className="bg-emerald-500 text-white px-6 py-2 rounded-lg ml-auto block">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, active }) {
  return (
    <div className="flex justify-between items-center">
      <span>{label}</span>
      <div
        className={`w-12 h-6 rounded-full p-1 transition ${
          active ? "bg-blue-600" : "bg-gray-400"
        }`}>
        <div
          className={`w-4 h-4 bg-white rounded-full transform transition ${
            active ? "translate-x-6" : "translate-x-0"
          }`}></div>
      </div>
    </div>
  );
}
