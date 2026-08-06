import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Shield,
  Upload,
  CheckCircle2,
  AlertCircle,
  ImageIcon,
  Loader2,
} from "lucide-react";

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    status: "active",
    role: "",
    profile: null,
  });

  const [roles, setRoles] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [existingProfileUrl, setExistingProfileUrl] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  // 1. Fetch User Data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`/api/users/${id}`);
        const data =
          response.data?.user || response.data?.data || response.data || {};

        setUser({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          status: data.status || "active",
          role: data.roles?.[0]?.name || data.role || "",
          profile: null,
        });

        // If user already has an avatar image on backend
        if (data.profile || data.avatar) {
          setExistingProfileUrl(data.profile || data.avatar);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setErrors((prev) => ({
          ...prev,
          fetch: ["Could not load user data."],
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  // 2. Fetch Roles List
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.get("/api/roles");
        const payload =
          response.data?.roles ?? response.data?.data ?? response.data ?? [];
        setRoles(Array.isArray(payload) ? payload : []);
      } catch (error) {
        console.error("Failed to fetch roles:", error);
      }
    };

    fetchRoles();
  }, []);

  // Handle Form Inputs
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "profile") {
      const file = files[0];
      if (file) {
        setUser((prev) => ({ ...prev, profile: file }));
        setPreviewUrl(URL.createObjectURL(file));
      }
    } else {
      setUser((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");
    setSubmitting(true);

    try {
      // If updating with a profile image, use FormData and method spoofing for Laravel (_method: "PUT")
      if (user.profile) {
        const formData = new FormData();
        formData.append("_method", "PUT");
        formData.append("name", user.name);
        formData.append("email", user.email);
        formData.append("phone", user.phone);
        formData.append("status", user.status);
        formData.append("role", user.role);
        formData.append("profile", user.profile);

        await api.post(`/api/users/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // Standard JSON PUT Request
        await api.put(`/api/users/${id}`, user);
      }

      setSuccess("Staff details updated successfully!");

      setTimeout(() => {
        navigate("/admin/staff");
      }, 1000);
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
      } else {
        console.error("Update failed:", error.response?.data || error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Helper for Initials
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#002B7F] animate-spin" />
        <p className="text-sm font-medium text-slate-500">
          Fetching staff details...
        </p>
      </div>
    );
  }

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
              Edit Staff Member
            </h1>
            <p className="text-sm text-slate-500">
              Update user details, adjust role permissions, or modify account status.
            </p>
          </div>
        </div>

        {/* Banners */}
        {success && (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {errors.fetch && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errors.fetch[0]}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-8">
            
            {/* Section 1: Profile Image */}
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
                Profile Photo
              </h2>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                
                {/* Image Preview Box */}
                <div className="relative w-24 h-24 rounded-2xl bg-blue-50 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : existingProfileUrl ? (
                    <img
                      src={existingProfileUrl}
                      alt="Current Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-bold text-[#002B7F]">
                      {getInitials(user.name)}
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-center sm:text-left">
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold cursor-pointer transition-all">
                    <Upload className="w-4 h-4" />
                    <span>Change Avatar</span>
                    <input
                      type="file"
                      name="profile"
                      accept="image/*"
                      onChange={handleChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-slate-400">
                    JPG, PNG or GIF. Max file size 2MB.
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

            {/* Section 2: Personal Information */}
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
                      placeholder="Full Name"
                      value={user.name}
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

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      value={user.email}
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

                {/* Phone Number */}
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
                      value={user.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
                    />
                  </div>
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
                      value={user.role}
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
                    value={user.status}
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

          {/* Form Actions */}
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
              className="px-6 py-2.5 bg-[#002B7F] hover:bg-blue-900 text-white rounded-xl font-semibold text-sm shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{submitting ? "Updating..." : "Update User"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}