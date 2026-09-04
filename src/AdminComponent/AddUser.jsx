import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { AUTH_ENDPOINTS, getXsrfToken } from "../api/axios";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Lock,
  Shield,
  Upload,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";

export default function AddUser() {
  const [roles, setRoles] = useState([]);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    status: "active",
    role: "",
    profile: null,
  });

  const [previewUrl, setPreviewUrl] = useState(null);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getRoles();
  }, []);

  const getRoles = async () => {
    try {
      const response = await api.get("/api/roles");
      const payload =
        response.data?.roles ?? response.data?.data ?? response.data ?? [];
      setRoles(Array.isArray(payload) ? payload : []);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      setErrors((prev) => ({
        ...prev,
        roles: ["Unable to load roles right now."],
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "profile") {
      const file = files[0];
      if (file) {
        setFormData((prev) => ({ ...prev, profile: file }));
        setPreviewUrl(URL.createObjectURL(file));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");
    setSubmitting(true);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("phone", formData.phone);
    data.append("status", formData.status);
    data.append("role", formData.role);

    if (formData.profile) {
      data.append("profile", formData.profile);
    }

    try {
      await api.get(AUTH_ENDPOINTS.csrf);
      const xsrfToken = getXsrfToken();

      if (!xsrfToken) {
        throw new Error("CSRF cookie was not set by the server.");
      }

      const response = await api.post("/api/register", data, {
        headers: {
          "X-XSRF-TOKEN": xsrfToken,
        },
      });

      setSuccess(response.data.message || "Staff member created successfully!");
      
      setTimeout(() => {
        navigate("/admin/staff");
      }, 1000);
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
      } else {
        console.error("Registration error:", error);
        setErrors({
          submit: [
            error.response?.data?.message ||
              "Unable to create the user. Please try again.",
          ],
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Back Button & Header */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/admin/staff")}
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-600 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#002B7F]">
              Add New Staff Member
            </h1>
            <p className="text-sm text-slate-500">
              Create a new user profile, assign credentials, and set permissions.
            </p>
          </div>
        </div>

        {/* Global Success / Error Banners */}
        {success && (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {errors.roles && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errors.roles[0]}</span>
          </div>
        )}

        {errors.submit && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errors.submit[0]}</span>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-8">
            
            {/* Section 1: Image Upload */}
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
                Profile Photo
              </h2>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative w-24 h-24 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <div className="space-y-2 text-center sm:text-left">
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold cursor-pointer transition-all">
                    <Upload className="w-4 h-4" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      name="profile"
                      accept="image/*"
                      onChange={handleChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-slate-400">
                    JPG, PNG or GIF. Max filesize 2MB.
                  </p>
                  {errors.profile && (
                    <p className="text-red-500 text-xs font-medium">
                      {errors.profile[0]}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Section 2: Personal Details */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="name"
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2.5 text-sm bg-white border ${
                        errors.name ? "border-red-500" : "border-slate-200"
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002B7F]`}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-500 text-xs">{errors.name[0]}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      placeholder="john@bistroos.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2.5 text-sm bg-white border ${
                        errors.email ? "border-red-500" : "border-slate-200"
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002B7F]`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs">{errors.email[0]}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="phone"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2.5 text-sm bg-white border ${
                        errors.password ? "border-red-500" : "border-slate-200"
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002B7F]`}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs">
                      {errors.password[0]}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Section 3: Role & Status */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Role & Operational Status
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Role */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2.5 text-sm bg-white border ${
                        errors.role ? "border-red-500" : "border-slate-200"
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002B7F] appearance-none text-slate-700 cursor-pointer`}
                    >
                      <option value="">Select Role</option>
                      {roles.map((role) => (
                        <option key={role.id || role.name} value={role.name}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.role && (
                    <p className="text-red-500 text-xs">{errors.role[0]}</p>
                  )}
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Account Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002B7F] text-slate-700 cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Form Controls */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/staff")}
              className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-sm text-slate-600 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-[#002B7F] hover:bg-blue-900 text-white rounded-xl font-semibold text-sm shadow-sm transition-all disabled:opacity-50"
            >
              {submitting ? "Creating Staff..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}