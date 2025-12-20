import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Laptop,
  X,
  AlertTriangle,
} from "lucide-react";

// --- Dummy Data ---
const initialDevices = [
  {
    id: "1",
    brand: "Apple",
    model: "MacBook Pro",
    serialNumber: "C02TQ0A9G8WN",
  },
  { id: "2", brand: "Lenovo", model: "ThinkPad", serialNumber: "PF18KBS2" },
  { id: "3", brand: "HP", model: "Spectre x360", serialNumber: "5CD4284G1J" },
  {
    id: "4",
    brand: "Asus",
    model: "ROG Zephyrus G14",
    serialNumber: "A1B2C3D4E5",
  },
  { id: "5", brand: "Acer", model: "Swift 3", serialNumber: "S3X9P7L2" },
  { id: "6", brand: "Dell", model: "XPS 15", serialNumber: "GHTY7U8I9O0P" },
  {
    id: "7",
    brand: "Microsoft",
    model: "Surface Laptop 4",
    serialNumber: "ZXCVB6N7M8L9",
  },
  {
    id: "8",
    brand: "Samsung",
    model: "Galaxy Book Pro",
    serialNumber: "QWERTY123456",
  },
  { id: "9", brand: "HP", model: "Pavilion 15", serialNumber: "ASDFG7890JKL" },
  { id: "10", brand: "Razer", model: "Blade 15", serialNumber: "UIOPQ5678RST" },
];

// --- Sub-Components ---

/**
 * Custom Modal Component
 */
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative p-6 border border-gray-200 transform scale-95 animate-scaleIn">
        <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          {title}
        </h3>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors">
          <X className="w-6 h-6" />
        </button>
        {children}
      </div>
    </div>
  );
};

/**
 * Edit/Add Device Form
 */
const DeviceForm = ({ device, onClose, onSave }) => {
  const [formData, setFormData] = useState(
    device || { brand: "", model: "", serialNumber: "" }
  );
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData(device || { brand: "", model: "", serialNumber: "" });
  }, [device]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); // Clear error on change
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.brand.trim()) newErrors.brand = "Brand is required.";
    if (!formData.model.trim()) newErrors.model = "Model is required.";
    if (!formData.serialNumber.trim())
      newErrors.serialNumber = "Serial Number is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-gray-900">
      <div>
        <label
          htmlFor="brand"
          className="block text-sm font-medium text-gray-700 mb-1">
          Brand
        </label>
        <input
          type="text"
          id="brand"
          name="brand"
          value={formData.brand}
          onChange={handleChange}
          className={`w-full p-3 rounded-lg bg-gray-100 border ${
            errors.brand ? "border-red-500" : "border-gray-300"
          } focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors`}
          placeholder="e.g., Apple"
        />
        {errors.brand && (
          <p className="text-red-400 text-xs mt-1 flex items-center">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {errors.brand}
          </p>
        )}
      </div>
      <div>
        <label
          htmlFor="model"
          className="block text-sm font-medium text-gray-700 mb-1">
          Model
        </label>
        <input
          type="text"
          id="model"
          name="model"
          value={formData.model}
          onChange={handleChange}
          className={`w-full p-3 rounded-lg bg-gray-100 border ${
            errors.model ? "border-red-500" : "border-gray-300"
          } focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors`}
          placeholder="e.g., MacBook Pro"
        />
        {errors.model && (
          <p className="text-red-400 text-xs mt-1 flex items-center">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {errors.model}
          </p>
        )}
      </div>
      <div>
        <label
          htmlFor="serialNumber"
          className="block text-sm font-medium text-gray-700 mb-1">
          Serial Number
        </label>
        <input
          type="text"
          id="serialNumber"
          name="serialNumber"
          value={formData.serialNumber}
          onChange={handleChange}
          className={`w-full p-3 rounded-lg bg-gray-100 border ${
            errors.serialNumber ? "border-red-500" : "border-gray-300"
          } focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors`}
          placeholder="e.g., C02TQ0A9G8WN"
        />
        {errors.serialNumber && (
          <p className="text-red-400 text-xs mt-1 flex items-center">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {errors.serialNumber}
          </p>
        )}
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium transition-colors">
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors">
          Save Device
        </button>
      </div>
    </form>
  );
};

/**
 * Pagination Component
 */
const Pagination = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center mt-6">
      <nav
        className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
        aria-label="Pagination">
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => onPageChange(number)}
            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
              ${
                number === currentPage
                  ? "z-10 bg-blue-600 border-blue-600 text-white"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              } transition-colors duration-200`}>
            {number}
          </button>
        ))}
      </nav>
    </div>
  );
};

// --- Main Component ---

const   MyDevice = () => {
  const [devices, setDevices] = useState(initialDevices);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null); // null for add, object for edit
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // As per design with 5 rows

  // Filtered and Paginated Devices
  const filteredDevices = useMemo(() => {
    return devices.filter(
      (device) =>
        device.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [devices, searchTerm]);

  const currentDevices = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredDevices.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredDevices, currentPage, itemsPerPage]);

  useEffect(() => {
    // Reset page to 1 if search term changes
    setCurrentPage(1);
  }, [searchTerm]);

  // Clamp current page if filtered results change (e.g., after delete or search)
  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(filteredDevices.length / itemsPerPage)
    );
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [filteredDevices.length, itemsPerPage, currentPage]);

  const handleAddDevice = () => {
    setEditingDevice(null);
    setIsModalOpen(true);
  };

  const handleEditDevice = (device) => {
    setEditingDevice(device);
    setIsModalOpen(true);
  };

  const handleDeleteDevice = (id) => {
    if (window.confirm("Are you sure you want to delete this device?")) {
      setDevices((prev) => prev.filter((device) => device.id !== id));
    }
  };

  const handleSaveDevice = (deviceToSave) => {
    if (editingDevice) {
      // Edit existing device
      setDevices((prev) =>
        prev.map((dev) => (dev.id === deviceToSave.id ? deviceToSave : dev))
      );
    } else {
      // Add new device with a safer unique id (use crypto.randomUUID if available)
      const newId =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      setDevices((prev) => [...prev, { ...deviceToSave, id: newId }]);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
        <h1 className="text-3xl font-bold text-blue-400 flex items-center">
          <Laptop className="w-8 h-8 mr-3" />
          My Devices
        </h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-gray-100 text-gray-900 rounded-lg pl-10 pr-4 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={handleAddDevice}
            className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition-all duration-300 transform hover:scale-[1.02]">
            <Plus className="w-5 h-5 mr-2" />
            Add New Device
          </button>
        </div>
      </div>

      {/* Devices Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-blue-50">
              <tr>
                {["Brand", "Model", "Serial Number", "Actions"].map(
                  (header) => (
                    <th
                      key={header}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold text-blue-600 uppercase tracking-wider">
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentDevices.length > 0 ? (
                currentDevices.map((device) => (
                  <tr
                    key={device.id}
                    className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {device.brand}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {device.model}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {device.serialNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleEditDevice(device)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 transform hover:scale-105">
                          <Edit className="w-4 h-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteDevice(device.id)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 transform hover:scale-105">
                          <Trash2 className="w-4 h-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-8 text-center text-gray-600 text-lg">
                    No devices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        totalItems={filteredDevices.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />

      {/* Add/Edit Device Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDevice ? "Edit Device" : "Add New Device"}>
        <DeviceForm
          device={editingDevice}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveDevice}
        />
      </Modal>
    </div>
  );
};

export default MyDevice;
