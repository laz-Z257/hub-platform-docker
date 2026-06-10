"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import UserSummaryCards from "@/components/UserSummaryCards";
import UserFilters from "@/components/UserFilters";
import UsersTable from "@/components/UsersTable";
import EditUserModal from "@/components/EditUserModal";
import { api } from "@/lib/api";
import type { ApiUser } from "@/types/user";

const PER_PAGE = 10;

export default function UsersPage() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<ApiUser | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleToggleStatus = useCallback(async (user: ApiUser) => {
    setActionLoading(user.id);
    try {
      const updated = await api.patch<ApiUser>(`/users/${user.id}/toggle-status`);
      setUsers((prev) => (Array.isArray(prev) ? prev : []).map((u) => (u.id === updated.id ? { ...u, ...updated } : u)));
    } catch (err) {
      console.error("Toggle status:", err instanceof Error ? err.message : err);
    } finally {
      setActionLoading(null);
    }
  }, []);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    api
      .get<{ items: ApiUser[]; total: number }>("/users?limit=200")
      .then((data) => {
        if (Array.isArray(data?.items)) setUsers(data.items);
      })
      .catch((err) => console.error("Users:", err instanceof Error ? err.message : err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, [fetchUsers]);

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.rol === "admin").length;
  const userCount = users.filter((u) => u.rol === "user").length;

  let filteredUsers = users;
  if (roleFilter !== "Todos") {
    filteredUsers = filteredUsers.filter((u) => u.rol === roleFilter);
  }
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredUsers = filteredUsers.filter(
      (u) =>
        u.nombre.toLowerCase().includes(term) ||
        (u.email || "").toLowerCase().includes(term) ||
        u.documento.includes(term)
    );
  }

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PER_PAGE));
  const pagedUsers = filteredUsers.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="bg-[#F8F8FC] dark:bg-gray-950 min-h-[calc(100vh-72px)] p-8">
      <UserSummaryCards
        totalUsers={totalUsers}
        adminCount={adminCount}
        userCount={userCount}
        loading={loading}
      />

      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[36px] font-bold text-[#25207E] font-inter">
          Gestión de Usuarios
        </h1>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-2 h-10 px-4 bg-[#25207E] border-none rounded-lg cursor-pointer text-[13px] font-semibold font-inter text-white"
          >
            <RefreshCw size={16} strokeWidth={2.5} className={loading ? "animate-spin" : ""} />
            Refrescar
          </button>

          <UserFilters
            roleFilter={roleFilter}
            searchTerm={searchTerm}
            onRoleChange={(role) => { setRoleFilter(role); setPage(1); }}
            onSearchChange={(term) => { setSearchTerm(term); setPage(1); }}
          />
        </div>
      </div>

      <UsersTable users={pagedUsers} onEdit={setEditingUser} onToggleStatus={handleToggleStatus} />

      <div className="flex items-center justify-between mt-5">
        <span className="text-[13px] text-gray-500 dark:text-gray-400 font-inter">
          Mostrando {Math.min((page - 1) * PER_PAGE + 1, filteredUsers.length)} a {Math.min(page * PER_PAGE, filteredUsers.length)} de{" "}
          {filteredUsers.length.toLocaleString()} usuarios
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
            style={{ opacity: page === 1 ? 0.5 : 1, cursor: page === 1 ? "default" : "pointer" }}
          >
            <ChevronLeft size={14} color="#6B7280" strokeWidth={2} />
          </button>

          {pages.map((p, i) =>
            p === "..." ? (
              <span key={`dot-${i}`} className="w-8 h-8 flex items-center justify-center text-[13px] text-gray-400 font-inter">
                ...
              </span>
            ) : (
              <button
                key={p}
                onClick={() => setPage(p)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-inter cursor-pointer"
                style={{
                  border: page === p ? "none" : "1px solid #E5E7EB",
                  backgroundColor: page === p ? "#25207E" : "#FFFFFF",
                  color: page === p ? "#FFFFFF" : "#374151",
                  fontWeight: page === p ? 600 : 400,
                }}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
            style={{ opacity: page === totalPages ? 0.5 : 1, cursor: page === totalPages ? "default" : "pointer" }}
          >
            <ChevronRight size={14} color="#6B7280" strokeWidth={2} />
          </button>
        </div>
      </div>

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={(updated) => {
            setUsers((prev) => (Array.isArray(prev) ? prev : []).map((u) => (u.id === updated.id ? updated : u)));
            setEditingUser(null);
          }}
        />
      )}
    </div>
  );
}
