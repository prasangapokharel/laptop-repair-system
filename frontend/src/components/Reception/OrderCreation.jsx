import * as React from 'react';
import { ChevronDown } from 'lucide-react';

// ----------------------
// Input Component
// ----------------------
const Input = ({ label, containerClassName = '', className = '', ...props }) => {
  return (
    <div className={`flex flex-col ${containerClassName}`}>
      {label && (
        <label className="mb-1.5 text-sm font-bold text-gray-900 ml-1">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2.5 rounded-full border-none outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 shadow-sm transition-all ${className}`}
        {...props}
      />
    </div>
  );
};

// ----------------------
// Select Component
// ----------------------
const Select = ({ label, options, containerClassName = '', className = '', ...props }) => {
  return (
    <div className={`flex flex-col ${containerClassName}`}>
      {label && (
        <label className="mb-1.5 text-sm font-bold text-gray-900 ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`w-full px-4 py-2.5 pr-10 rounded-full border-none outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 shadow-sm appearance-none cursor-pointer ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
          <ChevronDown size={20} />
        </div>
      </div>
    </div>
  );
};

// ----------------------
// Initial Form State
// ----------------------
const INITIAL_FORM_STATE = {
  customerSearch: "",
  deviceType: "",
  isNewDevice: false,
  brand: "",
  model: "",
  serialNumber: "",
  purchaseYear: "",
  condition: "Good",
  problemDescription: "",
  estimatedServiceCharge: "",
  estimatedPartsCost: ""
};

// ----------------------
// OrderCreation Component
// ----------------------
const OrderCreation = () => {
  const [formData, setFormData] = React.useState(INITIAL_FORM_STATE);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (isNew) => {
    setFormData(prev => ({ ...prev, isNewDevice: isNew }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Submitted:', formData);
    alert('Order created successfully (check console for data)');
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM_STATE);
  };

  const brands = [
    { value: '', label: 'Select Brand' },
    { value: 'apple', label: 'Apple' },
    { value: 'dell', label: 'Dell' },
    { value: 'hp', label: 'HP' },
    { value: 'lenovo', label: 'Lenovo' },
    { value: 'samsung', label: 'Samsung' },
  ];

  const conditions = [
    { value: 'Good', label: 'Good' },
    { value: 'Fair', label: 'Fair' },
    { value: 'Poor', label: 'Poor' },
    { value: 'Damaged', label: 'Damaged' },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Create Order</h1>

      <form onSubmit={handleSubmit} className="bg-gray-200/80 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
        
        {/* Customer Selection */}
        <section>
          <h2 className="text-lg font-bold text-black mb-3">Customer Selection</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              name="customerSearch"
              placeholder="Search existing customer"
              value={formData.customerSearch}
              onChange={handleChange}
              containerClassName="flex-grow"
            />
            <button
              type="button"
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2.5 px-6 rounded-full transition-colors shadow-sm whitespace-nowrap"
            >
              Add New Customer
            </button>
          </div>
        </section>

        {/* Device Selection */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-black">Device Selection</h2>

          <Input
            label="Device Type"
            name="deviceType"
            value={formData.deviceType}
            onChange={handleChange}
          />

          {/* Radio Buttons */}
          <div className="flex gap-6 py-1 ml-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${!formData.isNewDevice ? 'border-blue-600' : 'border-gray-400 bg-white'}`}>
                {!formData.isNewDevice && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
              </div>
              <input
                type="radio"
                name="deviceState"
                className="hidden"
                checked={!formData.isNewDevice}
                onChange={() => handleRadioChange(false)}
              />
              <span className="text-gray-800 font-medium">Select Existing Device</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.isNewDevice ? 'border-blue-600' : 'border-gray-400 bg-white'}`}>
                {formData.isNewDevice && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
              </div>
              <input
                type="radio"
                name="deviceState"
                className="hidden"
                checked={formData.isNewDevice}
                onChange={() => handleRadioChange(true)}
              />
              <span className="text-gray-800 font-medium">Select New Device</span>
            </label>
          </div>

          <Select
            label="Brand"
            name="brand"
            options={brands}
            value={formData.brand}
            onChange={handleChange}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Model"
              name="model"
              value={formData.model}
              onChange={handleChange}
            />
            <Input
              label="Serial Number"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Purchase Year"
              name="purchaseYear"
              type="number"
              value={formData.purchaseYear}
              onChange={handleChange}
            />
            <Select
              label="Device Condition"
              name="condition"
              options={conditions}
              value={formData.condition}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* Problem Description */}
        <section>
          <label className="block text-lg font-bold text-black mb-3">Problem Description</label>
          <textarea
            name="problemDescription"
            rows={5}
            className="w-full px-4 py-3 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 shadow-sm resize-none"
            placeholder="Describe the issue briefly"
            value={formData.problemDescription}
            onChange={handleChange}
          />
        </section>

        {/* Cost Estimation */}
        <section>
          <h2 className="text-lg font-bold text-black mb-3">Cost Estimation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Estimated Service Charge"
              name="estimatedServiceCharge"
              type="number"
              value={formData.estimatedServiceCharge}
              onChange={handleChange}
            />
            <Input
              label="Estimated Parts Cost"
              name="estimatedPartsCost"
              type="number"
              value={formData.estimatedPartsCost}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-md transition-colors"
          >
            Create Order
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-8 rounded-full shadow-md transition-colors"
          >
            Reset Form
          </button>
        </div>

      </form>
    </div>
  );
};

export default OrderCreation;
