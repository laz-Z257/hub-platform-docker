"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import UserSummaryCards from "@/components/UserSummaryCards";
import UserFilters from "@/components/UserFilters";
import UsersTable from "@/components/UsersTable";
import EditUserModal from "@/components/EditUserModal";
import CreateUserModal from "@/components/CreateUserModal";
import ResetPasswordModal from "@/components/ResetPasswordModal";
import { api } from "@/lib/api";
import { logger } from "@/lib/logger";
import Pagination from "@/components/Pagination";
import type { ApiUser } from "@hub/shared/types/user";

const PER_PAGE = 10;

export default function UsersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<ApiUser | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(searchParams.get("create") === "true");
  const [resetPasswordUser, setResetPasswordUser] = useState<ApiUser | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("create") === "true") {
      setShowCreateModal(true);
      router.replace("/dashboard/users");
    }
  }, [searchParams, router]);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    api
      .get<{ items: ApiUser[]; total: number }>("/users?limit=200")
      .then((data) => {
        if (Array.isArray(data?.items)) setUsers(data.items);
      })
      .catch((err) => logger.error("Error fetching users", { error: err instanceof Error ? err.message : err }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, [fetchUsers]);

  const handleToggleStatus = useCallback(async (user: ApiUser) => {
    setActionLoading(user.id);
    try {
      await api.patch(`/users/${user.id}/toggle-status`);
      fetchUsers();
    } catch (err) {
      logger.error("Toggle status error", { error: err instanceof Error ? err.message : err });
    } finally {
      setActionLoading(null);
    }
  }, [fetchUsers]);

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.rol === "admin").length;
  const userCount = users.filter((u) => u.rol === "user").length;

  let filteredUsers = users;
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
            searchTerm={searchTerm}
            onSearchChange={(term) => { setSearchTerm(term); setPage(1); }}
          />
        </div>
      </div>

      <UsersTable users={pagedUsers} onEdit={setEditingUser} onToggleStatus={handleToggleStatus} onResetPassword={setResetPasswordUser} />

      <Pagination
        page={page}
        totalPages={totalPages}
        total={filteredUsers.length}
        from={Math.min((page - 1) * PER_PAGE + 1, filteredUsers.length)}
        to={Math.min(page * PER_PAGE, filteredUsers.length)}
        itemLabel="usuarios"
        onPageChange={setPage}
      />

      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(created) => {
            setUsers((prev) => [created, ...(Array.isArray(prev) ? prev : [])]);
          }}
        />
      )}

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

      {resetPasswordUser && (
        <ResetPasswordModal
          userId={resetPasswordUser.id}
          userDocument={resetPasswordUser.documento}
          onClose={() => setResetPasswordUser(null)}
          onSuccess={() => {
            fetchUsers();
          }}
        />
      )}
    </div>
  );
}
