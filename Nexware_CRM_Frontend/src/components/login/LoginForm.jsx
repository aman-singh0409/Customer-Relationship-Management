import React, { useState } from "react";
import api from "../../api/api";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import Loader from "../ui/Loader"; 

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function LoginForm() {
  const navigate = useNavigate();
  const loginToStore = useAuthStore((state) => state.login);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  // Optional: Add a state to change the loader text during the wait
  const [isRedirecting, setIsRedirecting] = useState(false); 
  const [generalError, setGeneralError] = useState("");

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate on Blur
  const handleBlur = (e) => {
    const { name, value } = e.target;
    let errorMsg = "";

    if (name === "email") {
      if (!value) errorMsg = "Email is required.";
      else if (!validateEmail(value)) errorMsg = "Enter a valid email.";
    }

    if (name === "password") {
      if (!value) errorMsg = "Password is required.";
      else if (value.length < 8) errorMsg = "Password must be at least 8 characters.";
    }

    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  // Validate Form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required.";
    else if (!validateEmail(formData.email)) newErrors.email = "Enter a valid email.";

    if (!formData.password) newErrors.password = "Password is required.";
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setGeneralError(""); 

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const payload = { email: formData.email.trim(), password: formData.password };

      const res = await axios.post(api.Auth.Login, payload, {
        headers: { "Content-Type": "application/json" },
      });

      const data = res.data;

      if (!data.user || !data.token) throw new Error("Invalid login response.");

      loginToStore({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        token: data.token,
      });

      // --- LOGIC CHANGE START ---
      setIsRedirecting(true); // Flag to change button text (optional)

      // Wait 3 seconds (3000ms) before navigating
      setTimeout(() => {
        switch (data.user.role) {
          case "admin": navigate("/admin"); break;
          case "agent": navigate("/agent"); break;
          case "subadmin": navigate("/sub-admin"); break;
          case "teamhead": navigate("/team-head"); break;
          default: navigate("/login");
        }
        setSubmitting(false); // Stop loading after navigation triggers
      }, 3000);
      // --- LOGIC CHANGE END ---

    } catch (err) {
      const msg = err.response?.data?.message || "Login failed. Please check your credentials.";
      setGeneralError(msg);
      setSubmitting(false); // Only turn off loading here on error
      setIsRedirecting(false);
    } 
    // Removed 'finally' block so loading stays true during the 3s wait
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-lg bg-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-200">
              <span className="text-white font-bold text-xl">N</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-sm text-gray-500 mt-2">Sign in to your CRM account</p>
          </div>

          {/* General Error Alert */}
          {generalError && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email Field */}
            <div className="mb-5">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="agent@gmail.com"
                className={`w-full px-4 py-2.5 rounded-lg border bg-gray-50 focus:bg-white focus:ring-2 transition-all outline-none ${
                  errors.email 
                    ? "border-red-300 focus:border-red-500 focus:ring-red-100" 
                    : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-100"
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
              </div>
              
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Agent@123"
                  className={`w-full px-4 py-2.5 pr-12 rounded-lg border bg-gray-50 focus:bg-white focus:ring-2 transition-all outline-none ${
                    errors.password 
                      ? "border-red-300 focus:border-red-500 focus:ring-red-100" 
                      : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-100"
                  }`}
                />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.password}</p>
              )}
            </div>

            {/* Submit Button with Custom Loader */}
            <button
              type="submit"
              disabled={submitting}
              className={`w-full flex items-center justify-center rounded-lg text-white font-semibold shadow-md transition-all ${
                submitting 
                  ? "bg-indigo-400 cursor-not-allowed py-2" 
                  : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg py-2.5 transform hover:-translate-y-0.5"
              }`}
            >
              {submitting ? (
                <Loader 
                    type="sphere" 
                    text={isRedirecting ? "Redirecting..." : "Logging in..."} 
                    color="text-white" 
                    size="sm" 
                />
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}