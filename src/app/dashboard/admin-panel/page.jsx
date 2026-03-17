"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";

const rolePill = (role) =>
  role === "admin"
    ? "bg-emerald-100 text-emerald-700"
    : "bg-slate-100 text-slate-700";

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "U";

const UserTable = ({
  title,
  description,
  users,
  loading,
  onRoleChange,
  savingId,
  searchValue,
  onSearchChange,
  sortValue,
  onSortChange,
}) => {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white shadow-xl">
      <div className="border-b border-slate-100 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-500">{description}</p>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            Total: {users.length}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {typeof searchValue === "string" && (
            <input
              value={searchValue}
              onChange={(event) => onSearchChange?.(event.target.value)}
              placeholder="Search by name or gmail"
              className="w-full flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          )}
          <select
            value={sortValue}
            onChange={(event) => onSortChange?.(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <option value="admin-first">Admin First</option>
            <option value="user-first">User First</option>
            <option value="az">A to Z</option>
            <option value="za">Z to A</option>
            <option value="created-desc">Newest First</option>
            <option value="created-asc">Oldest First</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[640px] w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-6 py-3">Photo</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Gmail</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Verified</th>
              <th className="px-6 py-3 text-right">Change Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-slate-50/70">
                <td className="px-6 py-4">
                  <div className="h-10 w-10 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                    {user.photo ? (
                      <img
                        src={user.photo}
                        alt={user.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-600">
                        {getInitials(user.name)}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-900">{user.name}</div>
                </td>
                <td className="px-6 py-4 text-slate-600">{user.email}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${rolePill(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {user.verified === true ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Verified
                    </span>
                  ) : user.verified === false ? (
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                      Unverified
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      Unknown
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <select
                    disabled={loading || savingId === user._id}
                    value={user.role}
                    onChange={(event) =>
                      onRoleChange(user._id, event.target.value)
                    }
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-6 text-center text-sm text-slate-500"
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminPanelPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sortMode, setSortMode] = useState("admin-first");

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/users");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to load users");
      }
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setTimeout(() => setRefreshing(false), 600);
  };

  const handleRoleChange = async (id, role) => {
    const previousUsers = [...users];
    setUsers((prev) =>
      prev.map((user) => (user._id === id ? { ...user, role } : user))
    );
    try {
      setSavingId(id);
      setError("");
      const target = users.find((user) => user._id === id);
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, role, email: target?.email }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to update role");
      }
      if (data?.user) {
        setUsers((prev) =>
          prev.map((user) =>
            user._id === id
              ? {
                  ...user,
                  role: data.user.role || role,
                  name: data.user.name || user.name,
                  email: data.user.email || user.email,
                  photo: data.user.photo || user.photo,
                  verified:
                    data.user.verified ??
                    user.verified ??
                    null,
                }
              : user
          )
        );
      }
      const verifiedText =
        data?.user?.verified === true
          ? "Yes"
          : data?.user?.verified === false
          ? "No"
          : "Unknown";
    } catch (err) {
      setUsers(previousUsers);
      setError(err.message || "Failed to update role");
    } finally {
      setSavingId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    const term = userSearch.trim().toLowerCase();
    if (!term) return users;
    return users.filter((user) => {
      const name = (user.name || "").toLowerCase();
      const email = (user.email || "").toLowerCase();
      return name.includes(term) || email.includes(term);
    });
  }, [users, userSearch]);

  const totals = useMemo(() => {
    const total = users.length;
    const adminTotal = users.filter((u) => u.role === "admin").length;
    const userTotal = users.filter((u) => u.role !== "admin").length;
    const verifiedTotal = users.filter((u) => u.verified === true).length;
    return { total, adminTotal, userTotal, verifiedTotal };
  }, [users]);

  const sortedUsers = useMemo(() => {
    const list = [...filteredUsers];
    const roleScore = (role, adminFirst) =>
      adminFirst ? (role === "admin" ? 0 : 1) : role === "admin" ? 1 : 0;

    switch (sortMode) {
      case "admin-first":
        return list.sort((a, b) => roleScore(a.role, true) - roleScore(b.role, true));
      case "user-first":
        return list.sort((a, b) => roleScore(a.role, false) - roleScore(b.role, false));
      case "az":
        return list.sort((a, b) =>
          String(a.name || "").localeCompare(String(b.name || ""))
        );
      case "za":
        return list.sort((a, b) =>
          String(b.name || "").localeCompare(String(a.name || ""))
        );
      case "created-asc":
        return list.sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return aTime - bTime;
        });
      case "created-desc":
        return list.sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        });
      default:
        return list;
    }
  }, [filteredUsers, sortMode]);

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-8 text-white shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Admin Panel</h1>
            <p className="mt-2 text-sm text-slate-200">
              Manage roles and keep your team organized.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
              <span className="rounded-full bg-white/10 px-3 py-1">
                Total: {totals.total}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1">
                Admin: {totals.adminTotal}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1">
                Users: {totals.userTotal}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1">
                Verified: {totals.verifiedTotal}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${
                  loading || refreshing ? "animate-spin" : ""
                }`}
              />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <UserTable
          title="User Management"
          description="Manage all users from one place"
          users={sortedUsers}
          loading={loading}
          searchValue={userSearch}
          onSearchChange={setUserSearch}
          sortValue={sortMode}
          onSortChange={setSortMode}
          onRoleChange={handleRoleChange}
          savingId={savingId}
        />
      </div>
    </div>
  );
};

export default AdminPanelPage;
