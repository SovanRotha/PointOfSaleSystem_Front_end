import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  UserPlus,
  Pencil,
  Trash2,
  Search,
  Bell,
  Users,
  Shield,
  Filter,
  X,
  Check,
  ShieldAlert,
  Loader2,
} from "lucide-react";

export default function Staff() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    from: 0,
    to: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [rolesList, setRolesList] = useState([]);
  const [roleCounts, setRoleCounts] = useState({});
  const [loading, setLoading] = useState(false);

  // Permission Modal State
  const [allPermissions, setAllPermissions] = useState([]);
  const [selectedUserForPermissions, setSelectedUserForPermissions] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);

  const navigate = useNavigate();

  // Check user permissions dynamically against user payload
  const hasPermission = (permissionName) => {
    if (!currentUser) return false;
    // Check direct permissions
    const directPerms = currentUser.permissions?.map((p) => p.name) || [];
    if (directPerms.includes(permissionName)) return true;

    // Check permissions assigned via roles
    const rolePerms = currentUser.roles?.flatMap((r) => r.permissions?.map((p) => p.name) || []) || [];
    return rolePerms.includes(permissionName);
  };

  // 1. Fetch current logged in user & global permission list
  useEffect(() => {
    const fetchInitialAuth = async () => {
      try {
        const userRes = await api.get("/api/user");
        setCurrentUser(userRes.data);

        // Fetch all system permissions if user has rights
        const permRes = await api.get("/api/permissions");
        setAllPermissions(permRes.data?.data || permRes.data || []);
      } catch (err) {
        console.error("Initialization error:", err);
      }
    };
    fetchInitialAuth();
  }, []);

  // 2. Fetch staff list with pagination & filters
  const fetchUsers = useCallback(async (page = 1, search = "", role = "") => {
    setLoading(true);
    try {
      const response = await api.get("/api/users", {
        params: { page, search, role },
      });

      const resData = response.data;
      const paginatedData = resData.data?.data ? resData.data : resData;
      const items = paginatedData.data || [];

      setUsers(items);

      setPagination({
        currentPage: paginatedData.current_page || 1,
        lastPage: paginatedData.last_page || 1,
        total: paginatedData.total || 0,
        from: paginatedData.from || 0,
        to: paginatedData.to || 0,
      });

      // Role analytics count for visible page
      const counts = {};
      items.forEach((u) => {
        const rName = u.roles?.[0]?.name || "Unassigned";
        counts[rName] = (counts[rName] || 0) + 1;
      });
      setRoleCounts(counts);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. Fetch roles list for filter dropdown
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await api.get("/api/roles");
        setRolesList(res.data?.data || res.data || []);
      } catch (err) {
        console.error("Failed to fetch roles:", err);
      }
    };
    fetchRoles();
  }, []);

  // 4. Debounced listener for search and filter changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers(1, searchQuery, selectedRole);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedRole, fetchUsers]);

  // 5. Delete staff member
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) {
      return;
    }
    try {
      await api.delete(`/api/users/${id}`);
      const isLastItemOnPage = users.length === 1 && pagination.currentPage > 1;
      const targetPage = isLastItemOnPage ? pagination.currentPage - 1 : pagination.currentPage;
      fetchUsers(targetPage, searchQuery, selectedRole);
    } catch (error) {
      console.error("Failed to delete user:", error.response?.data || error.message);
    }
  };

  // Modal Handlers
  const openPermissionModal = (user) => {
    setSelectedUserForPermissions(user);
    // Combine direct and role permissions for modal initialization
    const activePerms = [
      ...(user.permissions?.map((p) => p.name) || []),
      ...(user.roles?.flatMap((r) => r.permissions?.map((p) => p.name) || []) || []),
    ];
    setUserPermissions([...new Set(activePerms)]);
  };

  const togglePermission = (permissionName) => {
    setUserPermissions((prev) =>
      prev.includes(permissionName)
        ? prev.filter((p) => p !== permissionName)
        : [...prev, permissionName]
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedUserForPermissions) return;
    setIsSavingPermissions(true);
    try {
      // Sync permissions via API endpoint
      await api.put(`/api/users/${selectedUserForPermissions.id}`, {
        permissions: userPermissions,
      });

      setSelectedUserForPermissions(null);
      fetchUsers(pagination.currentPage, searchQuery, selectedRole);
    } catch (err) {
      console.error("Failed to update user permissions:", err);
    } finally {
      setIsSavingPermissions(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 space-y-6">
      {/* Search and Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
            />
          </div>

          <div className="relative w-full sm:w-48">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full pl-10 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#002B7F] appearance-none text-slate-700 cursor-pointer"
            >
              <option value="">All Roles</option>
              {rolesList.map((role) => (
                <option key={role.id || role.name} value={role.name}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Current Authenticated User */}
        <div className="flex items-center gap-4 self-end md:self-auto">
          <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full">
            <Bell className="w-5 h-5" />
          </button>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-800">{currentUser?.name || "Loading..."}</p>
            <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">
              {currentUser?.roles?.[0]?.name || "Staff"}
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#002B7F] text-white flex items-center justify-center font-semibold text-sm">
            {getInitials(currentUser?.name)}
          </div>
        </div>
      </div>

      {/* Main Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#002B7F]">Staff Management</h1>
          <p className="text-sm text-slate-500">
            Manage your team accounts, access roles, and system authorization.
          </p>
        </div>

        {/* Allow registration action if allowed or authenticated */}
        <button
          onClick={() => navigate("/admin/addUser")}
          className="flex items-center justify-center gap-2 bg-[#002B7F] hover:bg-blue-900 text-white font-semibold px-4 py-2.5 rounded-lg text-sm shadow-sm transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Staff</span>
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Staff</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{pagination.total}</div>
          <p className="text-xs font-semibold text-emerald-600">Active accounts</p>
        </div>

        {Object.entries(roleCounts).map(([role, count]) => (
          <div key={role} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">{role}s</span>
              <Shield className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{count}</div>
            <p className="text-xs font-medium text-slate-400">Current page</p>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F1F5F9] text-slate-500 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Loading staff records...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-slate-400">
                    No staff members found.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const roleName = user.roles?.[0]?.name || "No Role";

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#002B7F] font-bold text-xs flex items-center justify-center shrink-0">
                            {getInitials(user.name)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{user.name}</div>
                            <div className="text-xs text-slate-400">ID: #{user.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#002B7F]">
                          {roleName}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                        {user.email}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Manage Permissions (Checked via backend permission) */}
                          {hasPermission("manage permissions") && (
                            <button
                              onClick={() => openPermissionModal(user)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all"
                              title="Manage Permissions"
                            >
                              <ShieldAlert className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => navigate(`/admin/editUser/${user.id}`)}
                            className="p-1.5 text-slate-500 hover:text-[#002B7F] hover:bg-slate-100 rounded-md transition-all"
                            title="Edit User"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-slate-50/50 border-t border-slate-200 text-sm text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-800">{pagination.from}</span> to{" "}
            <span className="font-semibold text-slate-800">{pagination.to}</span> of{" "}
            <span className="font-semibold text-slate-800">{pagination.total}</span> staff
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={pagination.currentPage <= 1 || loading}
              onClick={() => fetchUsers(pagination.currentPage - 1, searchQuery, selectedRole)}
              className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            <span className="text-xs font-semibold px-2">
              Page {pagination.currentPage} of {pagination.lastPage}
            </span>
            <button
              disabled={pagination.currentPage >= pagination.lastPage || loading}
              onClick={() => fetchUsers(pagination.currentPage + 1, searchQuery, selectedRole)}
              className="px-4 py-1.5 bg-[#002B7F] text-white rounded-lg font-medium hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Permissions Modal */}
      {selectedUserForPermissions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-800">Manage Permissions</h3>
                <p className="text-xs text-slate-500">
                  User: <span className="font-semibold">{selectedUserForPermissions.name}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedUserForPermissions(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                System Permissions
              </p>
              {allPermissions.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No permissions loaded from server.</p>
              ) : (
                allPermissions.map((perm) => {
                  const permName = typeof perm === "string" ? perm : perm.name;
                  const isChecked = userPermissions.includes(permName);
                  return (
                    <label
                      key={perm.id || permName}
                      onClick={() => togglePermission(permName)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? "bg-blue-50/60 border-blue-200 text-[#002B7F]"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-sm font-medium capitalize">
                        {permName.replace("_", " ")}
                      </span>
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                          isChecked
                            ? "bg-[#002B7F] border-[#002B7F] text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </label>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => setSelectedUserForPermissions(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200/60 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePermissions}
                disabled={isSavingPermissions}
                className="px-4 py-2 text-sm font-medium bg-[#002B7F] hover:bg-blue-900 text-white rounded-lg disabled:opacity-50 shadow-sm transition-all"
              >
                {isSavingPermissions ? "Saving..." : "Save Permissions"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}