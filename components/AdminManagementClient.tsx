"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Trash2, Lock } from "lucide-react";
import { getAdminUsers, createAdminUser, deleteAdminUser, updateAdminPassword } from "@/lib/admin-setup";

export function AdminManagementClient() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");

  useEffect(() => {
    fetchAdmins();
  }, []);

  async function fetchAdmins() {
    setLoading(true);
    const result = await getAdminUsers();
    if (result.success) {
      setAdmins(result.data || []);
    }
    setLoading(false);
  }

  async function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault();
    
    if (!newUsername.trim() || !newPassword.trim()) {
      alert("Username dan password wajib diisi");
      return;
    }

    if (newPassword.length < 8) {
      alert("Password minimal 8 karakter");
      return;
    }

    const result = await createAdminUser(newUsername, newPassword, newEmail || undefined);
    
    if (result.success) {
      alert("Admin berhasil ditambahkan");
      setNewUsername("");
      setNewPassword("");
      setNewEmail("");
      setShowAddForm(false);
      fetchAdmins();
    } else {
      alert("Error: " + result.error);
    }
  }

  async function handleDeleteAdmin(id: string, username: string) {
    if (!confirm(`Yakin hapus admin "${username}"?`)) return;

    const result = await deleteAdminUser(id);
    
    if (result.success) {
      alert("Admin berhasil dihapus");
      fetchAdmins();
    } else {
      alert("Error: " + result.error);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Memuat data admin...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-navy-900 p-3">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-navy-900">Kelola Admin</h1>
            <p className="text-sm text-slate-600">Tambah, hapus, atau ubah password admin</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Tambah Admin
        </button>
      </div>

      {showAddForm && (
        <div className="panel mb-6 p-6">
          <h2 className="mb-4 text-lg font-black">Tambah Admin Baru</h2>
          <form onSubmit={handleAddAdmin} className="space-y-4">
            <div>
              <label className="label">Username</label>
              <input
                type="text"
                className="field mt-2"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Contoh: admin_nf"
                required
              />
            </div>
            <div>
              <label className="label">Password (minimal 8 karakter)</label>
              <input
                type="password"
                className="field mt-2"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Password yang kuat"
                required
              />
            </div>
            <div>
              <label className="label">Email (opsional)</label>
              <input
                type="email"
                className="field mt-2"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="admin@nusafishing.com"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">
                Simpan Admin
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn-secondary"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-100 bg-sky-50">
                <th className="px-6 py-3 text-left font-black text-navy-900">Username</th>
                <th className="px-6 py-3 text-left font-black text-navy-900">Email</th>
                <th className="px-6 py-3 text-left font-black text-navy-900">Status</th>
                <th className="px-6 py-3 text-left font-black text-navy-900">Last Login</th>
                <th className="px-6 py-3 text-left font-black text-navy-900">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {admins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-600">
                    Tidak ada admin
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin.id} className="border-b border-navy-100 hover:bg-sky-50">
                    <td className="px-6 py-3 font-semibold text-navy-900">{admin.username}</td>
                    <td className="px-6 py-3 text-slate-600">{admin.email || "-"}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                          admin.is_active
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {admin.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-600">
                      {admin.last_login
                        ? new Date(admin.last_login).toLocaleDateString("id-ID")
                        : "Belum pernah"}
                    </td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => handleDeleteAdmin(admin.id, admin.username)}
                        className="inline-flex items-center gap-2 rounded-md bg-red-100 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-200"
                      >
                        <Trash2 className="h-4 w-4" />
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
