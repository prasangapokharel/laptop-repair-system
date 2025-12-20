import React, { useState } from "react";

const CustomerRegistration = () => {
  const [form, setForm] = useState({
   
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-white p-6">
      <div className="w-full max-w-md">
        <h2 className="text-blue-600 font-semibold mb-4">
          Customer Registration
        </h2>

        <div className="bg-gray-100 rounded-lg p-6 space-y-4">
          {/* Photo Upload */}
          <div className="flex items-center gap-4">
            <img
              src={
                form.photo
                  ? URL.createObjectURL(form.photo)
                  : "https://via.placeholder.com/80"
              }
              alt="profile"
              className="w-16 h-16 rounded-full object-cover"
            />
            <button className="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded">
              Upload Photo
            </button>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-md border border-green-400 bg-green-100 px-3 py-2 pr-10 focus:outline-none"
              />
              <span className="absolute right-3 top-2.5 text-green-600">
                ✔
              </span>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              E-mail Address
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-md border border-green-400 bg-green-100 px-3 py-2 pr-10 focus:outline-none"
              />
              <span className="absolute right-3 top-2.5 text-green-600">
                ✔
              </span>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded-md border border-green-400 bg-green-100 px-3 py-2 pr-10 focus:outline-none"
              />
              <span className="absolute right-3 top-2.5 text-green-600">
                ✔
              </span>
            </div>
          </div>

          {/* Action */}
          <div className="flex items-center gap-4 pt-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm">
              Register
            </button>
            <span className="text-green-600 text-sm flex items-center gap-1">
              ✔ Success
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerRegistration;
