import React, { useState } from "react";
import {
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  AlertTriangle,
  ChevronDown,
  Phone,
} from "lucide-react";

import axios from "axios"; // ADDED
import { useNavigate } from "react-router-dom"; // ADDED

// -------------------- INPUT COMPONENT --------------------

const InputField = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  icon: Icon,
  error,
}) => {
  return (
    <div className="space-y-1">
      <label className="text-pink-400 font-semibold flex items-center">
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full bg-gray-800 text-white rounded-lg px-4 py-3 border 
            ${Icon ? "pl-10" : ""}
            ${
              error
                ? "border-red-500 focus:border-red-500"
                : "border-gray-700 focus:border-blue-500"
            } 
            transition-all duration-200 focus:outline-none`}
        />
      </div>

      {error && (
        <p className="text-xs text-red-500 flex items-center">
          <AlertTriangle className="w-3 h-3 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

// -------------------- LOGIN FORM --------------------

const LoginForm = ({ formData, handleChange, switchView }) => {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.phone || !formData.password) {
      setError("Please enter phone and password.");
      return;
    }

    const loginData = {
      phone: formData.phone,
      password: formData.password,
    };

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/v1/auth/login",
        loginData
      );
      // store token & user info
      localStorage.setItem("token", res.data.tokens.access_token);
      console.log(res.data.tokens.access_token);
      localStorage.setItem("userId", res.data.user.id);
      localStorage.setItem("fullName", res.data.user.full_name);
      console.log("user login sucessfully");
      if (res.data.user.is_staff === false) {
        navigate("/customerdashboard");
      }
      // if (res.data.user.role) {
      //   localStorage.setItem("role", res.data.user.role);
      //   if (res.data.user.role === "admin") {
      //     navigate("/admindashboard");
      //     return;
      //   } else if (res.data.user.role === "customer") {
      //     navigate("/customerdashboard");
      //     return;
      //   }
      // }
      // navigate("/customerdashboard"); // redirect to dashboard or home page
      // navigate("");
      // redirect according to role if you have it
      // navigate("/dashboard");
    } catch (err) {
      setError("Invalid phone or password");
      console.log(err.response?.data || err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-3xl font-bold text-white flex items-center">
        <LogIn className="w-7 h-7 mr-3 text-blue-400" />
        Welcome Back
      </h2>

      {error && (
        <div className="bg-red-900 text-red-300 p-3 rounded-lg text-sm flex items-center">
          <AlertTriangle className="w-4 h-4 mr-2" /> {error}
        </div>
      )}

      <InputField
        label="Phone"
        name="phone"
        type="tel"
        placeholder="Enter your phone"
        value={formData.phone}
        onChange={handleChange}
        icon={Phone}
      />

      <InputField
        label="Password"
        name="password"
        type="password"
        placeholder="Enter your password"
        value={formData.password}
        onChange={handleChange}
        icon={Lock}
      />

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md hover:scale-[1.01] transition">
        <LogIn className="w-5 h-5 inline-block mr-2" />
        Log In
      </button>

      <p className="text-center text-sm text-blue-400 cursor-pointer hover:text-blue-300">
        <button onClick={() => switchView("signup")}>
          Don't have an account? Create one!
        </button>
      </p>
    </form>
  );
};

// -------------------- SIGNUP FORM --------------------

const SignupForm = ({ formData, handleChange, switchView, setFormData }) => {
  const [errors, setErrors] = useState({});
  const navigate = useNavigate(); // ADDED

  // Reset template after signup
  const init = {
    name: "",
    email: "",
    password: "",
    phone: "",
    agreeTerms: false,
  };

  const validate = () => {
    const newErr = {};
    if (!formData.name) newErr.name = "Name is required.";
    if (!formData.email) newErr.email = "Email is required.";
    if (!formData.password || formData.password.length < 4)
      newErr.password = "Password must be at least 4 characters.";
    if (!formData.phone) newErr.phone = "Phone number is required.";
    if (!formData.agreeTerms) newErr.agreeTerms = "Accept terms to continue.";
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const handleSubmit = async (e) => {
    // FIXED: async added
    e.preventDefault();

    if (!validate()) return;

    const userData = {
      full_name: formData.name, // <- match backend field
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
    };

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/v1/auth/register",
        userData
      );
      console.log(res.data);
      console.log("Signup successful!", res.data);
    } catch (err) {
      console.log(err.response?.data || err.message);
    }

    setFormData(init);
    switchView("login");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-3xl font-bold text-white flex items-center">
        <UserPlus className="w-7 h-7 mr-3 text-pink-400" />
        Create Account
      </h2>

      <InputField
        label="Name"
        name="name"
        placeholder="Enter your name"
        value={formData.name}
        onChange={handleChange}
        icon={User}
        error={errors.name}
      />

      <InputField
        label="Email"
        name="email"
        type="email"
        placeholder="Enter your email"
        value={formData.email}
        onChange={handleChange}
        icon={Mail}
        error={errors.email}
      />

      <InputField
        label="Phone Number"
        name="phone"
        type="tel"
        placeholder="Enter your phone number"
        value={formData.phone}
        onChange={handleChange}
        icon={Phone}
        error={errors.phone}
      />

      <InputField
        label="Password"
        name="password"
        type="password"
        placeholder="Enter password"
        value={formData.password}
        onChange={handleChange}
        icon={Lock}
        error={errors.password}
      />

      <div className="flex items-start space-x-3 mt-4">
        <input
          type="checkbox"
          name="agreeTerms"
          checked={formData.agreeTerms}
          onChange={handleChange}
          className="h-4 w-4 bg-gray-800 border-gray-700"
        />

        <label className="text-gray-300 text-sm">
          I agree to the{" "}
          <span className="text-blue-400 cursor-pointer">
            terms & conditions
          </span>
        </label>
      </div>

      {errors.agreeTerms && (
        <p className="text-xs text-red-500">{errors.agreeTerms}</p>
      )}

      <div className="flex space-x-4">
        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg shadow-md hover:scale-[1.01] transition">
          Submit
        </button>

        <button
          type="reset"
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg shadow-md hover:scale-[1.01] transition">
          Reset
        </button>
      </div>

      <div className="text-center text-sm text-pink-400 cursor-pointer hover:text-pink-300">
        <button onClick={() => switchView("login")}>
          Already have an account? Log In
        </button>
      </div>
    </form>
  );
};

// -------------------- MAIN APP --------------------

export default function LoginSignup() {
  const [view, setView] = useState("login");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    agreeTerms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #1f1f3a, #0a0a1a)" }}>
      <div
        className={`w-full max-w-md p-8 rounded-2xl shadow-2xl backdrop-blur-md border 
          ${view === "login" ? "border-blue-700/50" : "border-pink-700/50"}
          bg-gray-900/90`}>
        {view === "login" ? (
          <LoginForm
            formData={formData}
            handleChange={handleChange}
            switchView={setView}
          />
        ) : (
          <SignupForm
            formData={formData}
            handleChange={handleChange}
            switchView={setView}
            setFormData={setFormData}
          />
        )}
      </div>
    </div>
  );
}
